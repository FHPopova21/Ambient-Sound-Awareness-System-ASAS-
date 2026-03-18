import SwiftUI


// MARK: - Изглед „История“
struct HistoryView: View {
    
    struct HistoryItem: Identifiable {
        let id = UUID()
        let category: SoundCategory
        let title: String
        let time: String
        let subtitle: String
        let isCritical: Bool
    }
    
    // В момента е статична демо история, за да се доближим до дизайна
    private let items: [HistoryItem] = [
        .init(category: .dogBark, title: "Кучешки лай", time: "14:45", subtitle: "Днес", isCritical: false),
        .init(category: .carHorn, title: "Клаксон на кола", time: "14:12", subtitle: "Днес", isCritical: true),
        .init(category: .doorSignal, title: "Звънец / Чукане", time: "13:30", subtitle: "Днес", isCritical: false),
        .init(category: .babyCry, title: "Плачещо бебе", time: "12:15", subtitle: "Днес", isCritical: false),
        .init(category: .sirenAlarm, title: "Сирена / Аларма", time: "10:05", subtitle: "Днес", isCritical: true),
        .init(category: .construction, title: "Ремонтни дейности", time: "09:20", subtitle: "Днес", isCritical: false)
    ]
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    HStack {
                        Text("Sonar")
                            .font(.title2.bold())
                        Spacer()
                    }
                    .padding(.horizontal)
                    .padding(.top, 8)
                    
                    ForEach(items) { item in
                        HStack(spacing: 12) {
                            Text(item.category.emoji)
                                .font(.title2)
                                .frame(width: 36, height: 36)
                                .background(item.category.color.opacity(0.15))
                                .clipShape(Circle())
                            
                            VStack(alignment: .leading, spacing: 4) {
                                HStack {
                                    Text(item.title)
                                        .font(.subheadline.weight(.semibold))
                                    if item.isCritical {
                                        Text("ОПАСНОСТ")
                                            .font(.caption2.weight(.bold))
                                            .foregroundColor(.red)
                                            .padding(.horizontal, 6)
                                            .padding(.vertical, 2)
                                            .background(Color.red.opacity(0.1))
                                            .clipShape(Capsule())
                                    }
                                }
                                HStack(spacing: 4) {
                                    Image(systemName: "clock")
                                        .font(.caption2)
                                        .foregroundStyle(.secondary)
                                    Text(item.time)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                    Text("·")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                    Text(item.subtitle)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                            Spacer()
                        }
                        .padding()
                        .background(.ultraThinMaterial)
                        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                        .padding(.horizontal)
                    }
                    
                    Spacer(minLength: 16)
                }
            }
            .background(
                LinearGradient(colors: [Color(.systemBackground), Color(.secondarySystemBackground)],
                               startPoint: .top,
                               endPoint: .bottom)
                    .ignoresSafeArea()
            )
            .navigationBarHidden(true)
        }
    }
}

// MARK: - Основен изглед (Content View)
struct ContentView: View {
    // 🔴 ТУК Е МАГИЯТА: Инициализираме новия, истински AI мениджър!
    @StateObject private var detector = SoundDetector()
    
    var body: some View {
        TabView {
            LiveView()
                .environmentObject(detector) // Подаваме го на LiveView
                .tabItem {
                    Label("Начало", systemImage: "house.fill")
                }
            
            SimulatorView()
                .environmentObject(detector)
                .tabItem {
                    Label("Симулация", systemImage: "waveform")
                }
            
            HistoryView()
                .tabItem {
                    Label("История", systemImage: "bell")
                }
            
            SettingsView()
                .environmentObject(detector)
                .tabItem {
                    Label("Настройки", systemImage: "gearshape")
                }
        }
        .tint(.primary)
    }
}

// MARK: - Предварителен преглед (Preview)
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}

