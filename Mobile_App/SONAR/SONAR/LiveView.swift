import SwiftUI

struct LiveView: View {
    // Взимаме достъп до нашия мениджър с изкуствения интелект
    @EnvironmentObject var detector: SoundDetector
    @State private var breathe = false
    
    // Състояния за pop-up нотификацията
    @State private var showNotification = false
    @State private var notificationText = ""
    @State private var notificationTask: Task<Void, Error>? = nil
    
    var body: some View {
        ZStack(alignment: .top) {
            ScrollView {
                VStack(spacing: 24) {
                    // Заглавка
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Sonar")
                                .font(.title2.bold())
                            Text("Слушане на околната среда")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        ZStack {
                            Circle()
                                .fill(Color(.secondarySystemFill))
                                .frame(width: 40, height: 40)
                            Image(systemName: "person.crop.circle")
                                .foregroundStyle(.primary)
                                .font(.system(size: 22))
                        }
                    }
                    .padding(.horizontal)
                    .padding(.top, 12)
                    
                    // Основна карта „Слушане на околната среда“
                    VStack(spacing: 20) {
                        ZStack {
                            Circle()
                                .fill(LinearGradient(colors: [.purple.opacity(0.9), .blue.opacity(0.8)],
                                                     startPoint: .topLeading,
                                                     endPoint: .bottomTrailing))
                                .frame(width: 120, height: 120)
                                .shadow(color: .purple.opacity(0.3), radius: 20, y: 10)
                            Image(systemName: "waveform")
                                .font(.system(size: 40, weight: .semibold))
                                .foregroundStyle(.white)
                                .scaleEffect(breathe ? 1.2 : 0.95)
                                .animation(.easeInOut(duration: 1.8).repeatForever(autoreverses: true), value: breathe)
                        }
                        
                        VStack(spacing: 4) {
                            Text(detector.currentSoundLabel)
                                .font(.headline.weight(.semibold))
                            Text(detector.currentConfidence.isEmpty ? "Системата анализира звуци и ще ви извести при събитие." : detector.currentConfidence)
                                .font(.footnote)
                                .foregroundStyle(.secondary)
                                .multilineTextAlignment(.center)
                        }
                        .padding(.horizontal)
                        
                        Button {
                            if detector.isPaused {
                                detector.resumeListening()
                            } else {
                                detector.pauseListening()
                            }
                            let impact = UIImpactFeedbackGenerator(style: .medium)
                            impact.impactOccurred()
                        } label: {
                            HStack {
                                Image(systemName: detector.isPaused ? "play.fill" : "pause.fill")
                                Text(detector.isPaused ? "Продължи" : "Пауза")
                            }
                            .font(.subheadline.weight(.semibold))
                            .padding(.horizontal, 32)
                            .padding(.vertical, 10)
                            .foregroundColor(detector.isPaused ? .white : .black)
                            .background(detector.isPaused ? Color.blue : Color.white)
                            .clipShape(Capsule())
                            .shadow(color: .black.opacity(0.1), radius: 5, x: 0, y: 2)
                        }
                        .animation(.easeInOut(duration: 0.2), value: detector.isPaused)
                    }
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(.ultraThinMaterial)
                    .clipShape(RoundedRectangle(cornerRadius: 30, style: .continuous))
                    .padding(.horizontal)
                    
                    // 2. Last Detected Sound
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Последно засечен звук")
                            .font(.headline)
                        
                        HStack {
                            if detector.lastDetectedSoundLabel.isEmpty {
                                Text("Все още няма засечени звуци.")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                                    .padding(.vertical, 8)
                            } else {
                                if let category = SoundCategory(rawValue: detector.lastDetectedSoundLabel) ?? SoundCategory.allCases.first(where: { $0.displayName == detector.lastDetectedSoundLabel }) {
                                    Text(category.emoji)
                                        .font(.title2)
                                        .frame(width: 36, height: 36)
                                        .background(category.color.opacity(0.15))
                                        .clipShape(Circle())
                                }
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(detector.lastDetectedSoundLabel)
                                        .font(.body.weight(.medium))
                                    Text("Току-що")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                            Spacer()
                        }
                        .padding()
                        .background(.ultraThinMaterial)
                        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                    }
                    .padding(.horizontal)
                    
                    // 3. Today's Activity
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Активност днес")
                            .font(.headline)
                        
                        VStack(alignment: .leading, spacing: 16) {
                            let totalDetected = detector.todaysActivity.values.reduce(0, +)
                            Text("Засечени звуци: \(totalDetected)")
                                .font(.subheadline.weight(.semibold))
                            
                            VStack(spacing: 12) {
                                if detector.todaysActivity.isEmpty {
                                    HStack {
                                        Text("Все още няма данни.")
                                            .font(.subheadline)
                                            .foregroundStyle(.secondary)
                                        Spacer()
                                    }
                                } else {
                                    ForEach(detector.todaysActivity.sorted(by: { $0.value > $1.value }), id: \.key) { key, count in
                                        if let category = SoundCategory(rawValue: key) ?? SoundCategory.allCases.first(where: { $0.displayName == key }) {
                                            HStack {
                                                Text("\(category.emoji)  \(category.displayName)")
                                                Spacer()
                                                Text("\(count)").foregroundStyle(.secondary)
                                            }
                                        }
                                    }
                                }
                            }
                            .font(.subheadline)
                        }
                        .padding()
                        .background(.ultraThinMaterial)
                        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                    }
                    .padding(.horizontal)
                    
                    Spacer(minLength: 24)
                }
            }
            .background(
                LinearGradient(colors: [Color(.systemBackground), Color(.secondarySystemBackground)],
                               startPoint: .top,
                               endPoint: .bottom)
                .ignoresSafeArea()
            )
            .onAppear { breathe = true }

            
            // Pop-up нотификация (Toast)
            if showNotification {
                VStack {
                    Spacer() // Питаме нотификацията долу
                    
                    HStack(spacing: 16) {
                        ZStack {
                            Circle()
                                .fill(Color(.secondarySystemGroupedBackground))
                                .frame(width: 40, height: 40)
                                .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
                            Image(systemName: "bell.badge.fill")
                                .foregroundColor(.primary)
                                .font(.system(size: 20, weight: .semibold))
                        }
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text("ЗАСЕЧЕН ЗВУК")
                                .font(.caption2.weight(.bold))
                                .foregroundColor(.secondary)
                                .tracking(1.2)
                            Text(notificationText)
                                .font(.headline.weight(.bold))
                                .foregroundColor(.primary)
                        }
                        Spacer()
                    }
                    .padding(16)
                    .background(.ultraThinMaterial)
                    .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
                    .shadow(color: .black.opacity(0.15), radius: 20, y: 10)
                    .padding(.horizontal, 20)
                    .padding(.top, 24)
                    .transition(.move(edge: .top).combined(with: .opacity).combined(with: .scale(scale: 0.95)))
                    .zIndex(1)
                    .onTapGesture {
                        withAnimation(.spring(response: 0.4, dampingFraction: 0.7, blendDuration: 0)) {
                            showNotification = false
                        }
                    }
                }
            }
        }
        .onChange(of: detector.currentSoundLabel) { newValue in
            let ignoredLabels = ["Слушам...", "Спрян", "На пауза", "Готов за старт", "Системата анализира звуци и ще ви извести при събитие."]
            if !ignoredLabels.contains(newValue) {
                if UserDefaults.standard.bool(forKey: "isNotificationsEnabled") {
                    notificationText = newValue
                    withAnimation(.spring(response: 0.5, dampingFraction: 0.75, blendDuration: 0)) {
                        showNotification = true
                    }
                    
                    // Скриване след 4.5 секунди
                    notificationTask?.cancel()
                    notificationTask = Task {
                        try? await Task.sleep(nanoseconds: 4_500_000_000)
                        if !Task.isCancelled {
                            withAnimation(.spring(response: 0.4, dampingFraction: 0.8, blendDuration: 0)) {
                                showNotification = false
                            }
                        }
                    }
                }
            }
        }
    }
}
