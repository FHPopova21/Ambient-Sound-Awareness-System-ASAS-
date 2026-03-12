import { LiquidCard } from "../components/ui/LiquidCard";
import { Volume2, BellRing, Smartphone, Watch, Mic, Sliders, Ear } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { SOUND_CLASSES } from "../data/sounds";

export function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    vibration: true,
    watchAlerts: true,
    soundDetection: true,
  });

  const [enabledSounds, setEnabledSounds] = useState<Record<string, boolean>>(
    SOUND_CLASSES.reduce((acc, sound) => ({ ...acc, [sound.id]: true }), {})
  );

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSound = (id: string) => {
    setEnabledSounds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
        {/* Device Status */}
        <LiquidCard className="p-0 overflow-hidden">
            <div className="bg-white/10 p-4 font-semibold text-slate-800 border-b border-white/20">
                Устройства
            </div>
            <div className="divide-y divide-white/20">
                <div className="flex items-center justify-between p-4 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                        <Watch className="text-purple-600" />
                        <div>
                            <div className="font-medium">Smart Watch Series 7</div>
                            <div className="text-xs text-green-600">Свързан • 84% батерия</div>
                        </div>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                </div>
                <div className="flex items-center justify-between p-4 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                        <Smartphone className="text-blue-600" />
                        <div>
                            <div className="font-medium">iPhone 14 Pro</div>
                            <div className="text-xs text-green-600">Това устройство</div>
                        </div>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                </div>
            </div>
        </LiquidCard>

        {/* Global Settings */}
        <LiquidCard className="p-0 overflow-hidden">
            <div className="bg-white/10 p-4 font-semibold text-slate-800 border-b border-white/20">
                Настройки за известяване
            </div>
            <div className="divide-y divide-white/20">
                <SettingRow 
                    icon={BellRing} 
                    title="Известия" 
                    desc="Pop-up съобщения на екрана"
                    active={settings.notifications} 
                    onClick={() => toggleSetting('notifications')} 
                />
                <SettingRow 
                    icon={Volume2} 
                    title="Вибрация" 
                    desc="Хаптична обратна връзка при събития"
                    active={settings.vibration} 
                    onClick={() => toggleSetting('vibration')} 
                />
                <SettingRow 
                    icon={Mic} 
                    title="Разпознаване на звук" 
                    desc="Автоматично слушане във фонов режим"
                    active={settings.soundDetection} 
                    onClick={() => toggleSetting('soundDetection')} 
                />
            </div>
        </LiquidCard>

        {/* Sound Class Toggles */}
        <LiquidCard className="p-0 overflow-hidden">
            <div className="bg-white/10 p-4 font-semibold text-slate-800 border-b border-white/20 flex items-center gap-2">
                <Ear size={18} />
                Активни звуци
            </div>
            <div className="p-2 bg-blue-50/50 text-xs text-slate-500 px-4">
                Изберете за кои звуци искате да получавате известия.
            </div>
            <div className="divide-y divide-white/20">
                {SOUND_CLASSES.map((sound) => (
                     <SettingRow 
                        key={sound.id}
                        icon={() => <span className="text-lg">{sound.icon}</span>}
                        title={sound.label}
                        desc={sound.description}
                        active={enabledSounds[sound.id]} 
                        onClick={() => toggleSound(sound.id)} 
                    />
                ))}
            </div>
        </LiquidCard>

        <LiquidCard className="p-4 text-center">
            <h3 className="mb-2 font-semibold">Нуждаете се от помощ?</h3>
            <p className="mb-4 text-sm text-slate-600">Вижте ръководството за потребителя или се свържете с поддръжката.</p>
            <button className="w-full rounded-xl bg-slate-800 py-3 text-white shadow-lg transition-transform active:scale-95">
                Център за помощ
            </button>
        </LiquidCard>
    </div>
  );
}

function SettingRow({ icon: Icon, title, desc, active, onClick }: { icon: any, title: string, desc: string, active: boolean, onClick: () => void }) {
    return (
        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={onClick}>
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <Icon size={20} />
                </div>
                <div>
                    <div className="font-medium text-slate-800 text-sm">{title}</div>
                    <div className="text-xs text-slate-500 line-clamp-1">{desc}</div>
                </div>
            </div>
            <div className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${active ? 'bg-green-500' : 'bg-slate-300'}`}>
                <motion.div 
                    layout
                    className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm"
                    initial={false}
                    animate={{ left: active ? '24px' : '4px' }}
                />
            </div>
        </div>
    )
}
