import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var detector: SoundDetector
    @AppStorage("isNotificationsEnabled") private var isNotificationsEnabled: Bool = true
    @AppStorage("isVibrationEnabled") private var isVibrationEnabled: Bool = true
    
    // Състояние на батерията и устройството
    @State private var batteryLevel: Float = 0.0
    @State private var batteryState: UIDevice.BatteryState = .unknown
    @State private var deviceName: String = UIDevice.current.name
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Заглавка
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Sonar")
                                .font(.title2.bold())
                            Text("Активно слушане...")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                    }
                    .padding(.horizontal)
                    .padding(.top, 8)
                    
                    // Устройства
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Устройства")
                            .font(.headline)
                        VStack(spacing: 12) {
                            SettingsDeviceRow(title: "Apple Watch",
                                              subtitle: "Не е свързан", // Може да се обнови чрез WatchConnectivity
                                              icon: "applewatch",
                                              tint: .purple)
                            SettingsDeviceRow(title: deviceName,
                                              subtitle: batteryLevelText,
                                              icon: "iphone",
                                              tint: .blue)
                        }
                    }
                    .padding(.horizontal)
                    
                    // Настройки за известяване
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Настройки за известяване")
                            .font(.headline)
                        VStack(spacing: 12) {
                            SettingsToggleRow(title: "Известия",
                                              subtitle: "Pop‑up съобщения на екрана",
                                              icon: "message.fill",
                                              isOn: $isNotificationsEnabled)
                            SettingsToggleRow(title: "Вибрация",
                                              subtitle: "Хаптична обратна връзка при събития",
                                              icon: "waveform.path",
                                              isOn: $isVibrationEnabled)
                            SettingsToggleRow(title: "Разпознаване на звук",
                                              subtitle: "Автоматично слушане във фонов режим",
                                              icon: "ear.badge.waveform",
                                              isOn: Binding(
                                                  get: { !detector.isPaused },
                                                  set: { newValue in
                                                      if newValue {
                                                          detector.resumeListening()
                                                      } else {
                                                          detector.pauseListening()
                                                      }
                                                  }
                                              ))
                        }
                    }
                    .padding(.horizontal)
                    
                    // Активни звуци
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Активни звуци")
                            .font(.headline)
                        Text("Изберете за кои звуци искате да получавате известия.")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                        
                        VStack(spacing: 12) {
                            ForEach(SoundCategory.uiCases, id: \.self) { category in
                                ActiveSoundRow(category: category)
                            }
                        }
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
            .navigationBarHidden(true)
            .onAppear {
                UIDevice.current.isBatteryMonitoringEnabled = true
                self.batteryLevel = UIDevice.current.batteryLevel
                self.batteryState = UIDevice.current.batteryState
                
                NotificationCenter.default.addObserver(forName: UIDevice.batteryLevelDidChangeNotification, object: nil, queue: .main) { _ in
                    self.batteryLevel = UIDevice.current.batteryLevel
                }
                NotificationCenter.default.addObserver(forName: UIDevice.batteryStateDidChangeNotification, object: nil, queue: .main) { _ in
                    self.batteryState = UIDevice.current.batteryState
                }
            }
        }
    }
    
    private var batteryLevelText: String {
        let levelPercentage = batteryLevel >= 0 ? "\(Int(batteryLevel * 100))%" : "Неизвестна"
        let status: String
        switch batteryState {
        case .charging:
            status = "Зарежда се"
        case .full:
            status = "Заредена"
        case .unplugged:
            status = "Това устройство"
        case .unknown:
            status = "Неизвестно състояние"
        @unknown default:
            status = "Неизвестно състояние"
        }
        
        return "\(status) • \(levelPercentage) батерия"
    }
}

// MARK: - Подпомагащи редове

private struct SettingsDeviceRow: View {
    let title: String
    let subtitle: String
    let icon: String
    let tint: Color
    
    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(tint.opacity(0.15))
                    .frame(width: 38, height: 38)
                Image(systemName: icon)
                    .foregroundStyle(tint)
            }
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline.weight(.semibold))
                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Circle()
                .fill(Color.green)
                .frame(width: 10, height: 10)
        }
        .padding()
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
    }
}

private struct SettingsToggleRow: View {
    let title: String
    let subtitle: String
    let icon: String
    @Binding var isOn: Bool
    
    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(Color.secondary.opacity(0.12))
                    .frame(width: 34, height: 34)
                Image(systemName: icon)
                    .foregroundStyle(.primary)
            }
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline.weight(.semibold))
                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Toggle("", isOn: $isOn)
                .labelsHidden()
        }
        .padding()
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
    }
}

private struct ActiveSoundRow: View {
    let category: SoundCategory
    @AppStorage var isOn: Bool
    
    init(category: SoundCategory) {
        self.category = category
        self._isOn = AppStorage(wrappedValue: true, "soundEnabled_\(category.rawValue)")
    }
    
    var body: some View {
        HStack(spacing: 12) {
            Text(category.emoji)
                .font(.title2)
                .frame(width: 34, height: 34)
                .background(category.color.opacity(0.15))
                .clipShape(Circle())
            VStack(alignment: .leading, spacing: 4) {
                Text(category.displayName)
                    .font(.subheadline.weight(.semibold))
                Text(isOn ? "Получавате известия за този звук." : "Известията са изключени.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Toggle("", isOn: $isOn)
                .labelsHidden()
        }
        .padding()
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
    }
}
