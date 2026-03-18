import Foundation
import AVFoundation
import Accelerate
import SwiftUI

final class AudioCaptureService: NSObject {
    
    struct Configuration {
        var sampleRate: Double = 22_050
        var frameDurationSeconds: Double = 2.0
        var normalizePerFrame: Bool = false
        var analysisHopSeconds: Double = 2.0
        var targetChannels: AVAudioChannelCount = 1
        var ioBufferDuration: TimeInterval = 0.023
    }
    
    // MARK: - Публични свойства
    var configuration = Configuration()
    public var onFrame: (([Float]) -> Void)?
    public var isModelReady = true
    public var isPaused = false
    
    // MARK: - Частни свойства
    private let engine = AVAudioEngine()
    private var converter: AVAudioConverter?
    private var targetFormat: AVAudioFormat?
    private var bufferSamples: [Float] = []
    private var frameSamplesTarget: Int = 0
    private var isRunning = false
    
    //MARK: - Пауза и продължаване
    public func pause() {
        guard isRunning, !isPaused else {return}
        engine.pause()
        isPaused = true
        bufferSamples.removeAll()

        print("Аудио записът е спрян")
    }
    
    public func resume() throws {
        guard isRunning, isPaused else {return}
        try engine.start()

        isPaused = false

        print("Аудио записът е възобновен")

    }

    // MARK: - Стартиране на записа
    public func start(sampleRate: Double = 22_050,
                      frameDurationSeconds: Double = 2.0,
                      normalizePerFrame: Bool = false) async throws {
        
        guard !isRunning else { return }
        isRunning = true
        print("🔊 AudioCaptureService.start() извикан")
        
        configuration.sampleRate = sampleRate   // желаната честота за модела (22050 Hz)
        configuration.frameDurationSeconds = frameDurationSeconds
        configuration.normalizePerFrame = normalizePerFrame
        
        let session = AVAudioSession.sharedInstance()
        print("🔊 Текуща AVAudioSession категоря: \(session.category.rawValue), режим: \(session.mode.rawValue)")
        try session.setCategory(.playAndRecord,
                                mode: .default,
                                options: [.mixWithOthers, .defaultToSpeaker])
        try session.setPreferredSampleRate(configuration.sampleRate)
        try session.setPreferredIOBufferDuration(configuration.ioBufferDuration)
        try session.setActive(true)
        print("🔊 AVAudioSession активиран, sampleRate=\(configuration.sampleRate)")
        
        let inputNode = engine.inputNode
        let inputFormat = inputNode.inputFormat(forBus: 0)
        print("🔊 Input format: sampleRate=\(inputFormat.sampleRate), channels=\(inputFormat.channelCount)")
        
        // Форматът, който моделът очаква: 22050 Hz, 1 канал, Float32
        guard let desiredFormat = AVAudioFormat(commonFormat: .pcmFormatFloat32,
                                                sampleRate: configuration.sampleRate,
                                                channels: 1,
                                                interleaved: false) else {
            throw NSError(domain: "AudioCaptureService", code: 1, userInfo: [
                NSLocalizedDescriptionKey: "Неуспешно създаване на AVAudioFormat за 22050 Hz."
            ])
        }
        targetFormat = desiredFormat
        configuration.targetChannels = desiredFormat.channelCount
        
        // Конвертор от хардуерния формат (напр. 48000 Hz) към 22050 Hz
        if inputFormat.sampleRate != desiredFormat.sampleRate ||
            inputFormat.channelCount != desiredFormat.channelCount {
            converter = AVAudioConverter(from: inputFormat, to: desiredFormat)
            print("🔁 Активиран AVAudioConverter \(inputFormat.sampleRate)Hz -> \(desiredFormat.sampleRate)Hz")
        } else {
            converter = nil
            print("✅ Няма нужда от конвертор – форматът вече е подходящ")
        }
        
        // Target: точно 4 секунди @ 22050 Hz => 88200 семпъла
        frameSamplesTarget = Int(configuration.sampleRate * configuration.frameDurationSeconds)
        print("🎯 frameSamplesTarget = \(frameSamplesTarget) (sampleRate=\(configuration.sampleRate), duration=\(configuration.frameDurationSeconds)s)")
        
        inputNode.removeTap(onBus: 0)
        
        let hardwareFormat = inputFormat
        guard let targetFormat = targetFormat, let converter = converter else {
            print("❌ Липсва targetFormat или converter – прекратявам tap инсталацията")
            return
        }
        
        let targetSamples = frameSamplesTarget // 4 секунди при 22050 Hz (88200)
        let hopSamples = Int(configuration.sampleRate * configuration.analysisHopSeconds) // ~2 секунди (44100)
        
        inputNode.installTap(onBus: 0, bufferSize: 4096, format: hardwareFormat) { [weak self] buffer, _ in
            guard let self else { return }
            
            let capacity = AVAudioFrameCount(Double(buffer.frameLength) * 22050.0 / hardwareFormat.sampleRate)
            guard let convertedBuffer = AVAudioPCMBuffer(pcmFormat: targetFormat,
                                                         frameCapacity: capacity + 100) else { return }
            
            var error: NSError? = nil
            var hasRead = false // 💡 КРИТИЧНАТА ПРОМЕНЛИВА
            
            let inputBlock: AVAudioConverterInputBlock = { _, outStatus in
                if hasRead {
                    outStatus.pointee = .noDataNow
                    return nil
                }
                hasRead = true
                outStatus.pointee = .haveData
                return buffer
            }
            
            converter.convert(to: convertedBuffer, error: &error, withInputFrom: inputBlock)
            
            if error == nil {
                let numSamples = Int(convertedBuffer.frameLength)
                guard numSamples > 0,
                      let channelData = convertedBuffer.floatChannelData?[0] else { return }
                
                let array = Array(UnsafeBufferPointer(start: channelData, count: numSamples))
                self.bufferSamples.append(contentsOf: array)
                
                // Ако сме събрали 4 секунди (88200 семпъла)
                if self.bufferSamples.count >= targetSamples {
                    var frame = Array(self.bufferSamples.prefix(targetSamples))
                    
                    // RMS на суровия сигнал преди нормализация
                    let rms = sqrt(frame.map { $0 * $0 }.reduce(0, +) / Float(frame.count))
                    let silenceThreshold: Float = 0.0015
                    if rms < silenceThreshold {
                        print("🤫 Тиха рамка (RMS=\(rms)) – пропускам inference")
                        // Плъзгаме прозореца напред с hopSamples, дори при тишина
                        let removeCount = min(hopSamples, self.bufferSamples.count)
                        self.bufferSamples.removeFirst(removeCount)
                        return
                    }
                    
                    // Опционална нормализация (по желание)
                    if self.configuration.normalizePerFrame {
                        var mean: Float = 0
                        vDSP_meanv(frame, 1, &mean, vDSP_Length(frame.count))
                        var std: Float = 0
                        var variance: Float = 0
                        vDSP_measqv(frame, 1, &variance, vDSP_Length(frame.count))
                        variance -= mean * mean
                        std = sqrt(max(variance, 1e-8))
                        
                        let negMeanOverStd = -mean / std
                        vDSP_vsadd(frame, 1, [negMeanOverStd], &frame, 1, vDSP_Length(frame.count))
                        
                        var invStd = 1.0 / std
                        vDSP_vsmul(frame, 1, &invStd, &frame, 1, vDSP_Length(frame.count))
                    }
                    
                    // Изпращаме към AI модела
                    if self.isModelReady {
                        print("🚀 Изпращам frame към onFrame (sliding window, готов за AI)")
                        self.onFrame?(frame)
                    }
                    
                    // Плъзгаме прозореца напред с 2 секунди (~44100 семпъла)
                    let removeCount = min(hopSamples, self.bufferSamples.count)
                    self.bufferSamples.removeFirst(removeCount)
                }
            } else {
                print("❌ Грешка при AVAudioConverter: \(error!)")
            }
        }
        
        engine.prepare()
        try engine.start()
        print("✅ AVAudioEngine стартиран")
       
        NotificationCenter.default.addObserver(self,
                                               selector: #selector(handleInterruption(_:)),
                                               name: AVAudioSession.interruptionNotification,
                                               object: nil)
        NotificationCenter.default.addObserver(self,
                                               selector: #selector(handleRouteChange(_:)),
                                               name: AVAudioSession.routeChangeNotification,
                                               object: nil)
    }
    
    // MARK: - Спиране на записа
    public func stop() {
        guard isRunning else { return }
        isRunning = false
        engine.inputNode.removeTap(onBus: 0)
        engine.stop()
        NotificationCenter.default.removeObserver(self)
        bufferSamples.removeAll()
        converter = nil
        targetFormat = nil
    }

    
    // MARK: - Нотификации
    @objc private func handleInterruption(_ notification: Notification) {
        guard let info = notification.userInfo,
              let typeValue = info[AVAudioSessionInterruptionTypeKey] as? UInt,
              let type = AVAudioSession.InterruptionType(rawValue: typeValue) else { return }
        if type == .ended {
            try? engine.start()
        }
    }
    
    @objc private func handleRouteChange(_ notification: Notification) {
        // Optional
    }
}
