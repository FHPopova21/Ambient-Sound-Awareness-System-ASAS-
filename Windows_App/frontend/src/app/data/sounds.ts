export type SoundType = 'danger' | 'warning' | 'info';

export interface SoundClass {
  id: string;
  label: string;
  icon: string;
  type: SoundType;
  description: string;
}

export const SOUND_CLASSES: SoundClass[] = [
  { 
    id: 'siren_alarm', 
    label: "Сирена / Аларма", 
    icon: "🚨", 
    type: "danger",
    description: "Линейка, полиция или пожарна аларма."
  },
  { 
    id: 'glass_break', 
    label: "Счупено стъкло", 
    icon: "⚠️", 
    type: "danger",
    description: "Сигнал за инцидент или опасност."
  },
  { 
    id: 'car_horn', 
    label: "Клаксон", 
    icon: "🚗", 
    type: "danger",
    description: "Безопасност на улицата."
  },
  { 
    id: 'baby_cry', 
    label: "Плачещо бебе", 
    icon: "👶", 
    type: "warning",
    description: "Критично за родителски контрол."
  },
  { 
    id: 'construction', 
    label: "Ремонтни дейности", 
    icon: "🛠️", 
    type: "warning",
    description: "Сигнализира за силен технологичен шум."
  },
  { 
    id: 'dog_bark', 
    label: "Кучешки лай", 
    icon: "🐕", 
    type: "warning",
    description: "Информация за околната среда."
  },
  { 
    id: 'door_signal', 
    label: "Звънец / Чукане", 
    icon: "🔔", 
    type: "info",
    description: "Показва, че някой е на вратата."
  }
];

// Background noise is excluded from the UI list as it shouldn't trigger alerts
export const BACKGROUND_CLASS = {
  id: 'background',
  label: "Ф��нов шум",
  icon: "🌫️",
  description: "Нормален градски фон"
};
