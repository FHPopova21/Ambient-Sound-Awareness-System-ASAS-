import { LiquidCard } from "../components/ui/LiquidCard";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Info } from "lucide-react";
import { SOUND_CLASSES, SoundClass, SoundType } from "../data/sounds";

export function Simulation() {
    const [activeAlert, setActiveAlert] = useState<{ title: string, icon: string, type: SoundType } | null>(null);

    const simulateSound = (sound: SoundClass) => {
        const enabledSounds = JSON.parse(localStorage.getItem("sonar_enabled_sounds") || "{}");
        if (enabledSounds[sound.id] === false) return; // Don't simulate disabled sounds

        setActiveAlert({ title: sound.label, icon: sound.icon, type: sound.type });
        // Auto dismiss after 4 seconds
        setTimeout(() => {
            setActiveAlert(null);
        }, 4000);
    };

    return (
        <div className="space-y-6">
            <LiquidCard className="p-6 text-center">
                <h3 className="flex items-center justify-center gap-2 font-semibold text-slate-800">
                    <Info size={18} /> Как работи?
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                    Когато смарт часовникът засече звук, той вибрира по специфичен начин и показва визуална икона, за да ви уведоми незабавно за случващото се около вас.
                </p>
            </LiquidCard>

            <div className="mb-4 rounded-lg bg-blue-100/50 p-4 text-sm text-blue-800 border border-blue-200">
                <p>🔍 <strong>Режим Симулация:</strong> Натиснете бутоните по-долу, за да тествате как системата реагира на различни звуци.</p>
            </div>

            <AnimatePresence>
                {activeAlert && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed top-24 left-4 right-4 z-50 mx-auto max-w-sm"
                    >
                        <LiquidCard className={`border-l-4 p-4 shadow-2xl backdrop-blur-2xl ${activeAlert.type === 'danger' ? 'border-l-red-500 bg-red-50/90' :
                                activeAlert.type === 'warning' ? 'border-l-amber-500 bg-amber-50/90' :
                                    'border-l-blue-500 bg-blue-50/90'
                            }`}>
                            <div className="flex items-start gap-4">
                                <div className="text-4xl">{activeAlert.icon}</div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-800">Засечен звук!</h3>
                                    <p className="text-slate-600">{activeAlert.title}</p>
                                </div>
                                <button onClick={() => setActiveAlert(null)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>
                        </LiquidCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Unified Grid without Category Headers */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {SOUND_CLASSES.map(sound => {
                    const enabledSounds = JSON.parse(localStorage.getItem("sonar_enabled_sounds") || "{}");
                    const isEnabled = enabledSounds[sound.id] !== false;

                    return (
                        <SoundButton
                            key={sound.id}
                            sound={sound}
                            isEnabled={isEnabled}
                            onClick={() => simulateSound(sound)}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function SoundButton({ sound, isEnabled, onClick }: { sound: SoundClass, isEnabled: boolean, onClick: () => void }) {
    // We keep the color coding for feedback, but the structural grouping is removed.
    // Use slightly more subtle/unified base style if desired, or keep distinct colors for accessibility.
    // I'll keep the distinct colors as they are important for the "Liquid Glass" feedback loop described in the prompt.
    const bgColors = {
        danger: isEnabled ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-900' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-40',
        warning: isEnabled ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-40',
        info: isEnabled ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-40'
    };

    return (
        <motion.button
            whileTap={isEnabled ? { scale: 0.95 } : {}}
            onClick={onClick}
            disabled={!isEnabled}
            className={`flex flex-col items-center justify-center rounded-2xl border p-4 transition-all ${bgColors[sound.type]} ${!isEnabled ? 'cursor-not-allowed' : ''}`}
        >
            <span className="mb-2 text-3xl" style={{ filter: isEnabled ? 'none' : 'grayscale(100%)' }}>{sound.icon}</span>
            <span className="text-center text-sm font-medium leading-tight">{sound.label}</span>
        </motion.button>
    )
}
