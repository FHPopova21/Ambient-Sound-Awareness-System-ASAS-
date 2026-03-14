import SwiftUI


struct SimulatorView: View {
    @EnvironmentObject var detector: SoundDetector
    @State private var showNotification = false
    @State private var notificationText = ""
    @State private var notificationTask: Task<Void, Error>? = nil
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Заглавка
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Sonar")
                            .font(.title2.bold())
                        Text("Режим симулация")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    ZStack {
                        Circle()
                            .fill(LinearGradient(colors: [.purple, .blue],
                                                 startPoint: .topLeading,
                                                 endPoint: .bottomTrailing))
                            .frame(width: 40, height: 40)
                        Image(systemName: "person.crop.circle")
                            .foregroundStyle(.white)
                            .font(.system(size: 22))
                    }
                }
                .padding(.horizontal)
                .padding(.top, 12)
                
                // Карта "Как работи?"
                VStack(alignment: .leading, spacing: 12) {
                    HStack(spacing: 8) {
                        Image(systemName: "info.circle")
                            .foregroundStyle(.blue)
                        Text("Режим симулация")
                            .font(.headline)
                    }
                    
                    Text("Натиснете бутоните по‑долу, за да тествате как системата реагира на различни звуци.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .padding()
                .background(.ultraThinMaterial)
                .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
                .padding(.horizontal)

                // Режим симулация – решетка с бутони
                VStack(alignment: .leading, spacing: 12) {
                    let columns = [GridItem(.flexible()), GridItem(.flexible())]
                    LazyVGrid(columns: columns, spacing: 12) {
                        ForEach(SoundCategory.uiCases, id: \.self) { category in
                            Button {
                                detector.simulate(category: category)
                                HapticManager.play(for: category)
                                triggerNotification(for: category.displayName)
                            } label: {
                                HStack {
                                    Text(category.emoji)
                                        .font(.title2)
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(category.displayName)
                                            .font(.subheadline.weight(.semibold))
                                        Text(category.vibrationDescription)
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                            .lineLimit(2)
                                            .minimumScaleFactor(0.8)
                                    }
                                    Spacer()
                                }
                                .padding()
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(category.color.opacity(0.12))
                                .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
                .padding(.horizontal)
                
                Spacer(minLength: 24)
            }
        }
        .overlay(alignment: .bottom) {
            if showNotification {
                VStack {
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
                            Text("СИМУЛАЦИЯ")
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
                    .padding(.bottom, 24)
                }
                .transition(.move(edge: .bottom).combined(with: .opacity).combined(with: .scale(scale: 0.95)))
                .zIndex(1)
                .onTapGesture {
                    withAnimation(.spring(response: 0.4, dampingFraction: 0.7, blendDuration: 0)) {
                        showNotification = false
                    }
                }
            }
        }
        .background(
            LinearGradient(colors: [Color(.systemBackground), Color(.secondarySystemBackground)],
                           startPoint: .top,
                           endPoint: .bottom)
            .ignoresSafeArea()
        )
    }
    
    private func triggerNotification(for soundName: String) {
        if UserDefaults.standard.bool(forKey: "isNotificationsEnabled") {
            notificationText = soundName
            withAnimation(.spring(response: 0.5, dampingFraction: 0.75, blendDuration: 0)) {
                showNotification = true
            }
            
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
