import { motion, AnimatePresence } from "motion/react";
import { LiquidCard } from "../components/ui/LiquidCard";
import { AudioVisualizer } from "../components/ui/AudioVisualizer";
import { Mic, Bell, Battery, Wifi, BellRing, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../utils";
import { SOUND_CLASSES } from "../data/sounds";

declare global {
  interface Window {
    eel: any;
  }
}

export function Dashboard() {
  const [isListening, setIsListening] = useState(false);
  const [statusText, setStatusText] = useState("Готовност за анализ");
  const [showToast, setShowToast] = useState(false);
  const [detectedSound, setDetectedSound] = useState<any>(null);

  // Излагаме функция към Eel, за да може Python да ни "бута" новини
  useEffect(() => {
    if (window.eel) {
      window.eel.expose(update_ui_result, "update_ui_result");
    }
  }, []);

  function update_ui_result(result: any) {
    const settings = JSON.parse(localStorage.getItem("sonar_settings") || '{"notifications":true}');
    const enabledSounds = JSON.parse(localStorage.getItem("sonar_enabled_sounds") || "{}");

    if (result.status === "quiet") {
      setStatusText("Слушане на средата... ⏳");
      return;
    }

    // Find the sound ID by matching the label
    const soundEntry = SOUND_CLASSES.find(s => s.label === result.sound_type);
    const isEnabled = soundEntry ? enabledSounds[soundEntry.id] !== false : true;

    // If sound is filtered out by user, stay in listening mode
    if (!isEnabled) {
      setStatusText("Слушане на средата... ⏳");
      return;
    }

    const label = `Засечено: ${result.sound_type} (${result.confidence}%)`;
    setStatusText(result.status === "danger" ? `⚠️ ${label}` : label);
    setDetectedSound(result);

    // Показваме Toast ако са разрешени известията
    if (settings.notifications) {
      setShowToast(true);
      // Toast автоматично изчезва след 4.5 сек (преди следващия възможен анализ)
      setTimeout(() => setShowToast(false), 4500);
    }

    // След 5 секунди (колкото е cooldown на бекенда) връщаме статуса "Слушане"
    setTimeout(() => {
      setStatusText("Слушане на средата... ⏳");
    }, 5000);
  }

  const toggleListening = async () => {
    try {
      if (window.eel) {
        const nextState = !isListening;
        await window.eel.toggle_continuous_analysis(nextState)();
        setIsListening(nextState);

        if (nextState) {
          setStatusText("Слушане на средата... ⏳");
        } else {
          setStatusText("Анализът е спрян.");
        }
      }
    } catch (error) {
      console.error("Грешка при превключване на анализа:", error);
      setIsListening(false);
      setStatusText("Грешка при връзката");
    }
  };

  return (
    <div className="space-y-8 relative">
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

        <h2 className="text-2xl font-bold text-slate-800 tracking-tight min-h-[3rem] flex items-center justify-center px-4">
          <AnimatePresence mode="wait">
            <motion.span
              key={statusText}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              {statusText}
            </motion.span>
          </AnimatePresence>
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

      {/* Simulator-style Notification */}
      <AnimatePresence>
        {showToast && detectedSound && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-24 left-4 right-4 z-50 mx-auto max-w-sm pointer-events-auto"
          >
            <LiquidCard
              className={cn(
                "border-l-4 p-4 shadow-2xl backdrop-blur-2xl transition-colors duration-300",
                detectedSound.status === "danger" ? "border-l-red-500 bg-red-50/90" :
                  detectedSound.status === "warning" ? "border-l-amber-500 bg-amber-50/90" :
                    "border-l-blue-500 bg-blue-50/90"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">
                  {SOUND_CLASSES.find(s => s.label === detectedSound.sound_type)?.icon || "🔔"}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800">Засечен звук!</h3>
                  <p className="text-slate-600 font-medium">
                    {detectedSound.sound_type}
                    <span className="ml-2 text-[10px] font-black opacity-30 uppercase tracking-widest">
                      {detectedSound.confidence}%
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setShowToast(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  <X size={20} />
                </button>
              </div>
            </LiquidCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Status Row */}
      <div className="grid grid-cols-2 gap-4">
        <LiquidCard className="flex flex-col items-center p-5 text-center">
          <div className="mb-3 rounded-xl bg-green-100/50 p-2 text-green-600">
            <Battery size={22} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Батерия</span>
          <span className="mt-1 text-xl font-black text-slate-800">84%</span>
        </LiquidCard>
        <LiquidCard className="flex flex-col items-center p-5 text-center">
          <div className="mb-3 rounded-xl bg-blue-100/50 p-2 text-blue-600">
            <Wifi size={22} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Мрежа</span>
          <span className="mt-1 text-xl font-black text-slate-800">Стабилна</span>
        </LiquidCard>
      </div>

      {/* Recent Alerts Preview placeholder */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Последни събития</h3>
          <button className="text-[10px] font-bold text-blue-500 uppercase">Виж всички</button>
        </div>

        <div className="space-y-3">
          <LiquidCard className="flex items-center gap-5 p-5 transition-transform hover:scale-[1.01]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 shadow-inner">
              <span className="text-2xl">🐕</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800">Кучешки лай</h4>
              <p className="text-xs font-medium text-slate-400">Натиснете История за детайли</p>
            </div>
          </LiquidCard>
        </div>
      </div>
    </div>
  );
}
