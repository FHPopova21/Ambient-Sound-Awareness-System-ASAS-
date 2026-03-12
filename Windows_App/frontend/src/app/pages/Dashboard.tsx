import { motion } from "motion/react";
import { LiquidCard } from "../components/ui/LiquidCard";
import { AudioVisualizer } from "../components/ui/AudioVisualizer";
import { Mic, Bell, Battery, Wifi } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../utils";


export function Dashboard() {
  const [isListening, setIsListening] = useState(false);
  const [statusText, setStatusText] = useState("Готовност за анализ");

  // Излагаме функция към Eel, за да може Python да ни "бута" новини
  useEffect(() => {
    if (window.eel) {
      window.eel.expose(update_ui_result, "update_ui_result");
    }
  }, []);

  function update_ui_result(result: any) {
    if (result.status === "quiet") {
      setStatusText("Слушане на средата... ⏳");
      return;
    }

    if (result.status === "danger") {
      setStatusText(`⚠️ Засечена: ${result.sound_type} (${result.confidence}%)`);
    } else {
      setStatusText(`Засечено: ${result.sound_type} (${result.confidence}%)`);
    }
  }

  const toggleListening = async () => {
    try {
      if (window.eel) {
        const nextState = !isListening;

        // Казваме на Python да започне или спре
        await window.eel.toggle_continuous_analysis(nextState)();

        setIsListening(nextState);

        if (nextState) {
          setStatusText("Слушане на средата... ⏳");
        } else {
          setStatusText("Анализът е спрян.");
        }
      } else {
        console.log("Eel не е зареден. Вероятно си в браузъра.");
      }
    } catch (error) {
      console.error("Грешка при превключване на анализа:", error);
      setIsListening(false);
      setStatusText("Грешка при връзката");
    }
  };

  return (
    <div className="space-y-8">
      {/* Main Status Card */}
      <LiquidCard className="flex flex-col items-center justify-center py-14 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="mb-8 flex items-center justify-center"
        >
          <AudioVisualizer isListening={isListening} />
        </motion.div>

        <h2 className="text-2xl font-bold text-slate-800 tracking-tight min-h-[3rem] flex items-center justify-center">
          {statusText}
        </h2>
        <p className="mt-2 max-w-[240px] text-sm font-medium text-slate-500 leading-relaxed">
          {isListening
            ? "Системата анализира звука в реално време."
            : "Натиснете бутона, за да стартирате постоянна защита."}
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleListening}
          className={cn(
            "mt-8 rounded-2xl px-10 py-4 text-sm font-bold shadow-lg backdrop-blur-md transition-all",
            isListening
              ? "bg-red-500 text-white hover:bg-red-600 shadow-red-200"
              : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200"
          )}
        >
          {isListening ? "Спри анализа" : "Започни анализ"}
        </motion.button>
      </LiquidCard>

      {/* Quick Status Row */}
      <div className="grid grid-cols-2 gap-4">
        <LiquidCard className="flex flex-col items-center p-5 text-center" transition={{ delay: 0.2 }}>
          <div className="mb-3 rounded-xl bg-green-100/50 p-2 text-green-600">
            <Battery size={22} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Батерия</span>
          <span className="mt-1 text-xl font-black text-slate-800">84%</span>
        </LiquidCard>
        <LiquidCard className="flex flex-col items-center p-5 text-center" transition={{ delay: 0.3 }}>
          <div className="mb-3 rounded-xl bg-blue-100/50 p-2 text-blue-600">
            <Wifi size={22} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Мрежа</span>
          <span className="mt-1 text-xl font-black text-slate-800">Стабилна</span>
        </LiquidCard>
      </div>

      {/* Recent Alerts Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Последни събития</h3>
          <button className="text-[10px] font-bold text-blue-500 uppercase">Виж всички</button>
        </div>

        <div className="space-y-3">
          <LiquidCard className="flex items-center gap-5 p-5 transition-transform hover:scale-[1.01]" transition={{ delay: 0.4 }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 shadow-inner text-red-600">
              <Bell size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800">Клаксон на кола</h4>
              <p className="text-xs font-medium text-slate-400">Преди 2 минути • Висока опасност</p>
            </div>
          </LiquidCard>

          <LiquidCard className="flex items-center gap-5 p-5 transition-transform hover:scale-[1.01]" transition={{ delay: 0.5 }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 shadow-inner">
              <span className="text-2xl">🚪</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800">Чукане на врата</h4>
              <p className="text-xs font-medium text-slate-400">Преди 15 минути • Информация</p>
            </div>
          </LiquidCard>
        </div>
      </div>
    </div >
  );
}
