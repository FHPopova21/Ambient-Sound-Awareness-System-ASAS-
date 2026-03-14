//
//  SoundCategory.swift
//  SONAR
//
//  Created by Filipa Popova on 26.02.26.
//

import SwiftUI

enum SoundCategory: String, CaseIterable {
    case babyCry = "Baby_Cry"
    case background = "Background"
    case carHorn = "Car_Horn"
    case construction = "Construction"
    case dogBark = "Dog_Bark"
    case doorSignal = "Door_Signal"
    case glassBreak = "Glass_Break"
    case sirenAlarm = "Siren_Alarm"
    
    static var uiCases: [SoundCategory] {
        allCases.filter { $0 != .background }
    }
    
    
    var emoji: String {
        switch self {
        case .sirenAlarm: return "🚨"
        case .glassBreak: return "⚠️"
        case .carHorn: return "🚗"
        case .babyCry: return "👶"
        case .construction: return "🛠"
        case .dogBark: return "🐶"
        case .doorSignal: return "🔔"
        case .background: return "🌙"
        }
    }
    
    var color: Color {
        switch self {
        case .sirenAlarm: return Color(red: 0.95, green: 0.45, blue: 0.45)
        case .carHorn: return Color(red: 0.95, green: 0.65, blue: 0.45)
        case .construction: return Color(red: 0.95, green: 0.85, blue: 0.55)
        case .dogBark: return Color(red: 0.45, green: 0.85, blue: 0.65)
        case .babyCry: return Color(red: 0.55, green: 0.90, blue: 0.60)
        case .doorSignal: return Color(red: 0.55, green: 0.80, blue: 0.95)
        case .glassBreak: return Color(red: 0.72, green: 0.38, blue: 0.42)
        case .background: return .secondary
        }
    }
    
    var icon: String {
        switch self {
        case .sirenAlarm: return "light.beacon.max.fill"
        case .carHorn: return "car.fill"
        case .construction: return "wrench.and.screwdriver.fill"
        case .dogBark: return "pawprint.fill"
        case .babyCry: return "figure.child"
        case .doorSignal: return "door.left.hand.open"
        case .glassBreak: return "burst.fill"
        case .background: return "waveform"
        }
    }
    
    var displayName: String {
        switch self {
        case .sirenAlarm: return "Сирена"
        case .carHorn: return "Клаксон"
        case .construction: return "Ремонтни дейности"
        case .dogBark: return "Лай на куче"
        case .babyCry: return "Бебе"
        case .doorSignal: return "Звънец / Чукане"
        case .glassBreak: return "Счупено стъкло"
        case .background: return "Фон"
        }
    }
    
    var detectionThreshold: Double {
        switch self {
        case .construction: return 0.85
        case .dogBark: return 0.85
        case .babyCry: return 0.40
        case .glassBreak, .doorSignal: return 0.45
        case .sirenAlarm, .carHorn: return 0.60
        case .background: return 1.00
        }
    }
    
    var vibrationDescription: String {
        switch self {
        case .sirenAlarm: return "3 бързи силни вибрации"
        case .carHorn: return "2 силни вибрации"
        case .construction: return "Серия бързи вибрации"
        case .dogBark: return "1 средна вибрация"
        case .babyCry: return "3 меки вибрации"
        case .doorSignal: return "2 кратки вибрации"
        case .glassBreak: return "1 много силна вибрация"
        case .background: return "Без вибрация"
        }
    }
}

