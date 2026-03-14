import UIKit
import CoreHaptics

class HapticManager {
    // В бъдеще може да се реализира и CHHapticEngine за по-премиум контрол
    static func play(for category: SoundCategory) {
        // Проверяваме дали са позволени в настройките
        guard UserDefaults.standard.bool(forKey: "isVibrationEnabled") else { return }
        
        switch category {
        case .sirenAlarm:
            // 3 бързи силни
            playHapticSequence(count: 3, interval: 0.15, style: .heavy)
        case .carHorn:
            // 2 силни
            playHapticSequence(count: 2, interval: 0.2, style: .heavy)
        case .construction:
            // серия бързи
            playHapticSequence(count: 5, interval: 0.1, style: .medium)
        case .dogBark:
            // 1 средна
            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
        case .babyCry:
            // 3 меки
            playHapticSequence(count: 3, interval: 0.3, style: .soft)
        case .doorSignal:
            // 2 кратки
            playHapticSequence(count: 2, interval: 0.15, style: .light)
        case .glassBreak:
            // 1 много силна (UINotificationFeedbackGenerator .error е много силен)
            UINotificationFeedbackGenerator().notificationOccurred(.error)
        case .background:
            // без вибрация
            break
        }
    }
    
    // Помощна функция за серии от вибрации
    private static func playHapticSequence(count: Int, interval: TimeInterval, style: UIImpactFeedbackGenerator.FeedbackStyle) {
        let generator = UIImpactFeedbackGenerator(style: style)
        generator.prepare()
        
        for i in 0..<count {
            DispatchQueue.main.asyncAfter(deadline: .now() + interval * Double(i)) {
                generator.impactOccurred()
            }
        }
    }
}
