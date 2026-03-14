//
//  ContentView.swift
//  SONARWatch Watch App
//
//  Created by Filipa Popova on 6.03.26.
//

import SwiftUI

struct ContentView: View {
    @StateObject private var receiver = WatchReceiver.shared
    @State private var pulse = false
    
    var body: some View {
        VStack(spacing: 8) {
            // Listening Header
            HStack(spacing: 6) {
                Circle()
                    .fill(receiver.isListening ? Color.green : Color.red)
                    .frame(width: 8, height: 8)
                    .scaleEffect(receiver.isListening && pulse ? 1.2 : 0.8)
                    .opacity(receiver.isListening && pulse ? 1.0 : 0.5)
                    .animation(receiver.isListening ? .easeInOut(duration: 1.0).repeatForever() : .default, value: pulse)
                    .animation(.default, value: receiver.isListening)
                
                Text(receiver.isListening ? "Listening..." : "Paused")
                    .font(.footnote)
                    .foregroundColor(receiver.isListening ? .secondary : .red)
            }
            .padding(.top, 4)
            
            Spacer()
            
            // Last Sound
            VStack(spacing: 4) {
                if receiver.lastSoundName == "Няма данни" {
                    Text("Sonar is active")
                        .font(.headline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                } else {
                    Text(receiver.lastSoundEmoji)
                        .font(.system(size: 40))
                    
                    Text(receiver.lastSoundName)
                        .font(.headline)
                        .multilineTextAlignment(.center)
                        
                    Text(receiver.lastSoundTime)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            .padding()
            .frame(maxWidth: .infinity)
            .background(Color.white.opacity(0.1))
            .cornerRadius(12)
            
            Spacer()
        }
        .onAppear {
            pulse = true
        }
    }
}

#Preview {
    ContentView()
}
