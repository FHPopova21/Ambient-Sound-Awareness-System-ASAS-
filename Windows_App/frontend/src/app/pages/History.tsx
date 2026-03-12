import { LiquidCard } from "../components/ui/LiquidCard";
import { Clock, Search, Filter, Calendar } from "lucide-react";
import { SOUND_CLASSES, SoundType } from "../data/sounds";

export function History() {
  // Mock data using the new sound classes
  const historyItems = [
    { id: 1, soundId: 'dog_bark', time: "14:45", date: "Днес" },
    { id: 2, soundId: 'car_horn', time: "14:12", date: "Днес" },
    { id: 3, soundId: 'door_signal', time: "13:30", date: "Днес" },
    { id: 4, soundId: 'baby_cry', time: "12:15", date: "Днес" },
    { id: 5, soundId: 'siren_alarm', time: "10:05", date: "Днес" },
    { id: 6, soundId: 'construction', time: "09:20", date: "Днес" },
    { id: 7, soundId: 'door_signal', time: "19:45", date: "Вчера" },
    { id: 8, soundId: 'dog_bark', time: "18:30", date: "Вчера" },
  ];

  // Helper to find sound details
  const getSoundDetails = (id: string) => {
    return SOUND_CLASSES.find(s => s.id === id) || { 
        label: "Неизвестен", icon: "?", type: "info" as SoundType, description: "" 
    };
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center gap-2 rounded-xl bg-white/20 p-2 backdrop-blur-md border border-white/30 shadow-sm">
        <Search className="ml-2 text-slate-500" size={20} />
        <input 
            type="text" 
            placeholder="Търсене в историята..." 
            className="w-full bg-transparent px-2 py-1 text-slate-800 placeholder-slate-500 outline-none"
        />
        <button className="rounded-lg bg-white/30 p-2 hover:bg-white/40 transition-colors">
            <Filter size={18} className="text-slate-700" />
        </button>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {historyItems.map((item) => {
            const sound = getSoundDetails(item.soundId);
            
            return (
                <LiquidCard key={item.id} className="flex items-center justify-between p-4 transition-transform active:scale-[0.99]">
                    <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl shadow-inner ${
                            sound.type === 'danger' ? 'bg-red-100' : 
                            sound.type === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
                        }`}>
                            {sound.icon}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-800">{sound.label}</span>
                                {sound.type === 'danger' && (
                                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600">
                                        Опасност
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                <span className="flex items-center gap-1">
                                    <Clock size={12} /> {item.time}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar size={12} /> {item.date}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Status Indicator Dot */}
                    <div className={`h-2.5 w-2.5 rounded-full ring-2 ring-white/50 ${
                        sound.type === 'danger' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 
                        sound.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                </LiquidCard>
            );
        })}
      </div>
    </div>
  );
}
