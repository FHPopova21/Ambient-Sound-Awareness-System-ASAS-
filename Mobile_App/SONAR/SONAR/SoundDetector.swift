import Foundation
import CoreML
import SwiftUI
import Combine
import UIKit
import UserNotifications

struct SoundClassProb: Identifiable, Sendable {
    let id = UUID()
    let name: String
    let probability: Double
}

@MainActor
class SoundDetector: ObservableObject {
    
    private let audioService = AudioCaptureService()
    
    // 🔴 Създаваме Актора веднъж и го ползваме постоянно
    private let preprocessor = AudioPreprocessor()
    private var model: MLModel?
    private var modelInputName: String?
    private var modelLabelOutputName: String?
    private var modelProbsOutputName: String?
    
    @Published var currentSoundLabel: String = "Готов за старт"
    @Published var currentConfidence: String = "0%"
    @Published var lastDetectedSoundLabel: String = ""
    @Published var probabilities: [SoundClassProb] = []
    @Published var isPaused: Bool = false
    
    // Съхраняваме активността за деня (колко пъти е засечен всеки звук)
    @Published var todaysActivity: [String: Int] = [:]
    
    // Rate limiting notifications
    private var lastNotificationTimes: [String: Date] = [:]
    private let notificationCooldown: TimeInterval = 10.0
    
    // Катинар, който пази модела да не се претоварва с висящи задачи
    private var isProcessing = false
    
    private let classOrder = [
        "Baby_Cry",
        "Background",
        "Car_Horn",
        "Construction",
        "Dog_Bark",
        "Door_Signal",
        "Glass_Break",
        "Siren_Alarm"
    ]
    
    init() {
        var defaultValues: [String: Any] = [
            "isSoundRecognitionEnabled": true,
            "isVibrationEnabled": true,
            "isNotificationsEnabled": true
        ]
        for category in SoundCategory.allCases {
            defaultValues["soundEnabled_\(category.rawValue)"] = true
        }
        UserDefaults.standard.register(defaults: defaultValues)
        
        WatchSessionManager.shared.startSession()
        
        do {
            let config = MLModelConfiguration()
            self.model = try Self.loadBundledModel(configuration: config)
            self.configureModelIO()
            print("AI Моделът е зареден успешно!")
            
            UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
                if granted {
                    print("Дадено е разрешение за системни известия.")
                }
            }
            
            startListening()
        } catch {
            print("Грешка при зареждане на CoreML: \(error)")
        }
    }
    
    func startListening() {
        audioService.onFrame = { [weak self] audioSamples in
            Task { @MainActor in
                guard let self = self else { return }
                
                let rms = sqrt(audioSamples.map { $0 * $0 }.reduce(0, +) / Float(audioSamples.count))
                print("Ниво на звука (RMS): \(rms)")
                
                // Ако моделът още обработва предишен прозорец – пропускаме този
                if self.isProcessing {
                    print("⚠️ AI е зает, пропускам този прозорец...")
                    return
                }
                self.isProcessing = true
                
                do {
                    defer { self.isProcessing = false }
                    // 1) Ресемплираме от реалния sample rate (~48000 Hz) към 22050 Hz за 4 секунди
                    let resampled = Self.resampleTo22050(audioSamples: audioSamples)
                    
                    // 2) Изчисляваме Mel-спектрограмата върху нормализираните и ресемплирани семпли
                    let rawMelMatrix = try await self.preprocessor.processToMelSpectrogram(audioSamples: resampled)
                    
                    // Когато Акторът приключи, продължаваме тук на Главната нишка
                    guard let model = self.model else { return }
                    guard let inputName = self.modelInputName else { return }
                    
                    // Опаковаме вече готовата матрица
                    let nMels = 128
                    let expectedFrames = 173
                    let shape = [1, 1, nMels, expectedFrames] as [NSNumber]
                    let multiArray = try MLMultiArray(shape: shape, dataType: .float32)
                    let ptr = multiArray.dataPointer.bindMemory(to: Float.self, capacity: nMels * expectedFrames)
                    
                    // m - честоти (128), t - време (173)
                    for m in 0..<nMels {
                        for t in 0..<expectedFrames {
                            // Индексът е m * ширина + t
                            ptr[m * expectedFrames + t] = rawMelMatrix[m][t]
                        }
                    }
                    
                    // CoreML предсказание (label + probabilities)
                    let provider = try MLDictionaryFeatureProvider(dictionary: [
                        inputName: MLFeatureValue(multiArray: multiArray)
                    ])
                    let out = try await model.prediction(from: provider)
                    
                    var (predictedLabel, probs) = Self.extractPrediction(out: out,
                                                                         labelOutputName: self.modelLabelOutputName,
                                                                         probsOutputName: self.modelProbsOutputName)
                    
                    // Ако изходът са logits/нескалируеми стойности – нормализираме със softmax
                    if !probs.isEmpty {
                        let entries = Array(probs)
                        let values = entries.map { $0.value }
                        let soft = Self.softmax(values)
                        var normalized: [String: Double] = [:]
                        for (idx, entry) in entries.enumerated() {
                            normalized[entry.key] = soft[idx]
                        }
                        probs = normalized
                    }
                    
                    let label = predictedLabel ?? Self.argmaxLabel(from: probs)
                    let confidence = probs[label] ?? 0.0
                    
                    // UI: показваме вероятности (скриваме Background)
                    let orderedForUI = self.classOrder
                        .filter { $0 != "Background" }
                        .compactMap { name -> SoundClassProb? in
                            guard let p = probs[name] else { return nil }
                            return SoundClassProb(name: name, probability: p)
                        }
                        .sorted(by: { $0.probability > $1.probability })
                    self.probabilities = orderedForUI
                    
                    // Debug top-3: показваме и Background за диагностика
                    let orderedForLog = self.classOrder
                        .compactMap { name -> (String, Double)? in
                            guard let p = probs[name] else { return nil }
                            return (name, p)
                        }
                        .sorted(by: { $0.1 > $1.1 })
                    let top3 = orderedForLog.prefix(3)
                    let debugLine = top3
                        .map { "\($0.0)=\(Int($0.1 * 100))%" }
                        .joined(separator: ", ")
                    print("🔎 Top3 класове (вкл. Background): \(debugLine)")
                    
                    // Праг според класа + скриваме Background
                    let category = SoundCategory(rawValue: label)
                    let threshold = category?.detectionThreshold ?? 0.5
                    
                    let isEnabled = UserDefaults.standard.bool(forKey: "soundEnabled_\(label)")
                    
                    
                    if label == "Background" || confidence < threshold || !isEnabled {
                        self.currentSoundLabel = "Слушам..."
                        self.currentConfidence = "--"
                    } else {
                        // Регистрираме звука в активността
                        self.todaysActivity[label, default: 0] += 1
                        
                        self.currentSoundLabel = category?.displayName ?? label
                        self.lastDetectedSoundLabel = category?.displayName ?? label
                        self.currentConfidence = "\(Int(confidence * 100))% сигурност"
                        if let category = category {
                            HapticManager.play(for: category)
                            WatchSessionManager.shared.sendSoundDetection(category: category.rawValue)
                        }
                        
                        let now = Date()
                        let lastTime = self.lastNotificationTimes[label] ?? Date.distantPast
                        if now.timeIntervalSince(lastTime) > self.notificationCooldown {
                            self.lastNotificationTimes[label] = now
                            self.sendLocalNotification(title: "Засечен звук", body: category?.displayName ?? label)
                        }
                    }
                    
                } catch {
                    self.isProcessing = false
                    print("Грешка: \(error)")
                }
            }
        }
        
        audioService.isModelReady = true
        
        Task {
            do {
                // Отключваме агресивната нормализация
                try await audioService.start(sampleRate: 22050, frameDurationSeconds: 4.0, normalizePerFrame: false)
                
                if UserDefaults.standard.bool(forKey: "isSoundRecognitionEnabled") {
                    self.currentSoundLabel = "Слушам..."
                    self.isPaused = false
                    WatchSessionManager.shared.sendState(isListening: true)
                } else {
                    self.pauseListening()
                }
            } catch {
                print("Грешка при стартиране на микрофона: \(error)")
            }
        }
    }
    
    func stopListening() {
        audioService.stop()
        self.currentSoundLabel = "Спрян"
        WatchSessionManager.shared.sendState(isListening: false)
    }
    
    func pauseListening() {
        audioService.pause()
        isPaused = true
        currentSoundLabel = "На пауза"
        currentConfidence = "--"
        UserDefaults.standard.set(false, forKey: "isSoundRecognitionEnabled")
        WatchSessionManager.shared.sendState(isListening: false)
    }
    
    func resumeListening() {
        do {
            try audioService.resume()
            isPaused = false
            currentSoundLabel = "Слушам..."
            UserDefaults.standard.set(true, forKey: "isSoundRecognitionEnabled")
            WatchSessionManager.shared.sendState(isListening: true)
        } catch {
            print("Грешка при продължаване: \(error)")
        }
    }
    
    // MARK: - Simulation helpers (за режима с бутоните)
    func simulate(category: SoundCategory) {
        currentSoundLabel = category.displayName
        lastDetectedSoundLabel = category.displayName
        currentConfidence = "Симулация"
        
        WatchSessionManager.shared.sendSoundDetection(category: category.rawValue)
        
        let now = Date()
        let lastTime = self.lastNotificationTimes[category.rawValue] ?? Date.distantPast
        if now.timeIntervalSince(lastTime) > self.notificationCooldown {
            self.lastNotificationTimes[category.rawValue] = now
            self.sendLocalNotification(title: "Засечен звук (Симулация)", body: category.displayName)
        }
    }
    
    
    
    private func sendLocalNotification(title: String, body: String) {
        guard UserDefaults.standard.bool(forKey: "isNotificationsEnabled") else { return }
        
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: nil)
        UNUserNotificationCenter.current().add(request)
    }
    
    private static func loadBundledModel(configuration: MLModelConfiguration) throws -> MLModel {
        let candidates: [(String, String)] = [
            ("SonarMobileNet", "mlmodelc"),
            ("SonarMobileNetV2", "mlmodelc"),
            ("SONAR", "mlmodelc")
        ]
        for (name, ext) in candidates {
            if let url = Bundle.main.url(forResource: name, withExtension: ext) {
                return try MLModel(contentsOf: url, configuration: configuration)
            }
        }
        throw NSError(domain: "SoundDetector", code: 1, userInfo: [
            NSLocalizedDescriptionKey: "Не намерих CoreML модела в Bundle (.mlmodelc)."
        ])
    }
    
    private func configureModelIO() {
        guard let model else { return }
        
        // Input: първият multiArray вход
        let inputs = model.modelDescription.inputDescriptionsByName
        if let (name, _) = inputs.first(where: { $0.value.type == .multiArray }) {
            self.modelInputName = name
        }
        
        // Output: string label + dictionary probabilities
        let outputs = model.modelDescription.outputDescriptionsByName
        if let (name, _) = outputs.first(where: { $0.value.type == .string }) {
            self.modelLabelOutputName = name
        }
        if let (name, _) = outputs.first(where: { $0.value.type == .dictionary }) {
            self.modelProbsOutputName = name
        }
        
        print("🧩 Model IO: input=\(modelInputName ?? "?"), labelOut=\(modelLabelOutputName ?? "?"), probsOut=\(modelProbsOutputName ?? "?")")
    }
    
    private static func extractPrediction(out: MLFeatureProvider,
                                         labelOutputName: String?,
                                         probsOutputName: String?) -> (label: String?, probs: [String: Double]) {
        var label: String?
        var probs: [String: Double] = [:]
        
        // Label
        if let name = labelOutputName, let v = out.featureValue(for: name), v.type == .string {
            label = v.stringValue
        } else {
            // fallback: first string output
            for name in out.featureNames {
                if let v = out.featureValue(for: name), v.type == .string {
                    label = v.stringValue
                    break
                }
            }
        }
        
        // Probs
        let probsFeature: MLFeatureValue?
        if let name = probsOutputName {
            probsFeature = out.featureValue(for: name)
        } else {
            probsFeature = out.featureNames
                .compactMap { out.featureValue(for: $0) }
                .first(where: { $0.type == .dictionary })
        }
        
        if let probsFeature, probsFeature.type == .dictionary {
            let dict = probsFeature.dictionaryValue
            for (k, v) in dict {
                if let key = k as? String {
                    probs[key] = Double(truncating: v)
                }
            }
        }
        
        return (label, probs)
    }
    
    private static func softmax(_ values: [Double]) -> [Double] {
        guard !values.isEmpty else { return [] }
        let maxVal = values.max() ?? 0.0
        let expValues = values.map { exp($0 - maxVal) }
        let sumExp = expValues.reduce(0, +)
        guard sumExp > 0 else { return Array(repeating: 0.0, count: values.count) }
        return expValues.map { $0 / sumExp }
    }
    
    private static func argmaxLabel(from probs: [String: Double]) -> String {
        probs.max(by: { $0.value < $1.value })?.key ?? "Background"
    }
    
    // MARK: - Helper: ресемплиране към 22050 Hz за 4 секунди
    private static func resampleTo22050(audioSamples: [Float]) -> [Float] {
        let targetSampleRate: Float = 22_050.0
        let targetDuration: Float = 4.0
        let targetCount = Int(targetSampleRate * targetDuration) // 88200
        
        guard !audioSamples.isEmpty else {
            return [Float](repeating: 0, count: targetCount)
        }
        
        let sourceCount = audioSamples.count
        if sourceCount == targetCount {
            return audioSamples
        }
        
        var result = [Float](repeating: 0, count: targetCount)
        let ratio = Float(sourceCount - 1) / Float(targetCount - 1)
        
        for i in 0..<targetCount {
            let srcIndex = Float(i) * ratio
            let low = Int(srcIndex)
            let high = min(low + 1, sourceCount - 1)
            let frac = srcIndex - Float(low)
            
            let s0 = audioSamples[low]
            let s1 = audioSamples[high]
            result[i] = s0 * (1 - frac) + s1 * frac
        }
        
        return result
    }
}
