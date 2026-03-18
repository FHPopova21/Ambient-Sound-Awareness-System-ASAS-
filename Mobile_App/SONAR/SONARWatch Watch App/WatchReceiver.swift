import Foundation
import WatchConnectivity
import WatchKit
import SwiftUI
import Combine

@MainActor
class WatchReceiver: NSObject, ObservableObject, WCSessionDelegate {
    
    static let shared = WatchReceiver()
    @Published var lastSoundName: String = "Няма данни"
    @Published var lastSoundEmoji: String = ""
    @Published var lastSoundTime: String = "--:--"
    @Published var isListening: Bool = true
    
    private let session = WCSession.default
    
    private override init() {
        super.init()
        if WCSession.isSupported() {
            session.delegate = self
            session.activate()
        }
    }
    
    // MARK: - Делегат на WCSession (WCSessionDelegate)
    nonisolated func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        print("⌚️ WCSession активирана на Watch. Състояние: \(activationState.rawValue)")
    }
    
    nonisolated func session(_ session: WCSession, didReceiveMessage message: [String : Any]) {
        Task { @MainActor in
            if let soundRawValue = message["sound"] as? String {
                self.processSound(rawValue: soundRawValue)
            }
            if let isListening = message["isListening"] as? Bool {
                self.isListening = isListening
            }
        }
    }
    
    nonisolated func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String : Any]) {
        Task { @MainActor in
            if let isListening = applicationContext["isListening"] as? Bool {
                self.isListening = isListening
            }
        }
    }
    
    private func processSound(rawValue: String) {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        self.lastSoundTime = formatter.string(from: Date())
        
        var emoji = "🔊"
        var displayName = rawValue
        var hapticType: WKHapticType = .notification
        
        // Съпоставяне на звуците (съвпада с това от iPhone)
        switch rawValue {
        case "Siren_Alarm":
            emoji = "🚨"
            displayName = "Сирена"
            hapticType = .notification // 3 бързи
        case "Car_Horn":
            emoji = "🚗"
            displayName = "Клаксон"
            hapticType = .directionUp // 2 силни
        case "Glass_Break":
            emoji = "⚠️"
            displayName = "Счупено стъкло"
            hapticType = .failure // 1 много силна
        case "Baby_Cry":
            emoji = "👶"
            displayName = "Бебе"
            hapticType = .start // 3 меки
        case "Door_Signal":
            emoji = "🔔"
            displayName = "Звънец"
            hapticType = .click // 2 кратки
        case "Dog_Bark":
            emoji = "🐶"
            displayName = "Лай на куче"
            hapticType = .directionDown // 1 средна
        case "Construction":
            emoji = "🛠"
            displayName = "Ремонт"
            hapticType = .retry // 5 бързи
        default:
            break
        }
        
        self.lastSoundName = displayName
        self.lastSoundEmoji = emoji
        
        print("⌚️ Часовникът получи: \(displayName)")
        
        // Стартираме физическата вибрация на китката
        WKInterfaceDevice.current().play(hapticType)
    }
}
