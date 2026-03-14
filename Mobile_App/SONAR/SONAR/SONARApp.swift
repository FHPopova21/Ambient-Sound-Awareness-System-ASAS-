//
//  SONARApp.swift
//  SONAR
//
//  Created by Filipa Popova on 25.02.26.
//

import SwiftUI
import UserNotifications

// 1. Създаваме AppDelegate, който ще прихваща събитията на ниво приложение
class AppDelegate: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate {
    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        
        // 2. Казваме на Notification Center, че AppDelegate ще обработва известията
        UNUserNotificationCenter.current().delegate = self
        return true
    }
    
    // 3. Тази функция позволява известието да изскочи (banner/sound/badge),
    //    дори когато потребителят в момента използва приложението (на преден план).
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                willPresent notification: UNNotification,
                                withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .sound, .badge, .list])
    }
}

@main
struct SONARApp: App {
    // 4. Свързваме AppDelegate към SwiftUI жизнения цикъл
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
