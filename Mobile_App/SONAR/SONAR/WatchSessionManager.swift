import Foundation
import WatchConnectivity

class WatchSessionManager: NSObject, WCSessionDelegate {
    
    static let shared = WatchSessionManager()
    
    private let session = WCSession.default
    
    private override init() {
        super.init()
        if WCSession.isSupported() {
            session.delegate = self
            session.activate()
        }
    }
    
    func startSession() {
        if WCSession.isSupported() {
            session.activate()
        }
    }
    
    func sendSoundDetection(category: String) {
        guard session.isReachable else {
            print("⌚️ WCSession is not reachable.")
            return
        }
        
        let message: [String: Any] = ["sound": category]
        session.sendMessage(message, replyHandler: nil) { error in
            print("⌚️ Грешка при изпращане до Watch: \(error.localizedDescription)")
        }
    }
    
    func sendState(isListening: Bool) {
        let state: [String: Any] = ["isListening": isListening]
        
        do {
            try session.updateApplicationContext(state)
        } catch {
            print("⌚️ Грешка при изпращане на Application Context до Watch: \(error.localizedDescription)")
        }
        
        if session.isReachable {
            session.sendMessage(state, replyHandler: nil) { error in
                print("⌚️ Грешка при изпращане на state message до Watch: \(error.localizedDescription)")
            }
        }
    }
    
    // MARK: - WCSessionDelegate (iOS needed methods)
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        print("⌚️ WCSession активирана на iOS. Състояние: \(activationState.rawValue)")
    }
    
    func sessionDidBecomeInactive(_ session: WCSession) {
        // Задължителен метод за iOS, празно е Ок
    }
    
    func sessionDidDeactivate(_ session: WCSession) {
        // Задължителен метод за iOS, реактивираме сесията
        session.activate()
    }
}
