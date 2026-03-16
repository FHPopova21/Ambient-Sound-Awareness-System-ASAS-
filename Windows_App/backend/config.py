import os
import sys

def get_resource_path(relative_path):
    """
    Връща абсолютния път до ресурса. 
    Работи както за нормална разработка, така и когато е пакетирано като .exe!
    """
    try:
        # PyInstaller създава тайна папка и пази пътя до нея в sys._MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        # Ако не сме в .exe, ползваме нормалната главна папка (backend/)
        base_path = os.path.dirname(os.path.abspath(__file__))

    return os.path.join(base_path, relative_path)

# Пътища
PROJECT_ROOT = get_resource_path("")

# За тежестите на модела
# В .exe ще са в главната папка, в dev са в ../../models/
if getattr(sys, 'frozen', False):
    WEIGHTS_PATH = get_resource_path('best_mobilenet.pth')
    WEB_DIR = get_resource_path('dist')
else:
    WEIGHTS_PATH = os.path.abspath(os.path.join(PROJECT_ROOT, '..', '..', 'models', 'best_mobilenet.pth'))
    WEB_DIR = os.path.abspath(os.path.join(PROJECT_ROOT, '..', 'frontend', 'dist'))

# Настройки за анализ
COOLDOWN_SECONDS = 5.0
SAMPLE_RATE = 22050
WINDOW_DURATION = 4.0

# Лейбъли и мапинг
LABELS = [
    "Baby_Cry", "Background", "Car_Horn", 
    "Construction", "Dog_Bark", "Door_Signal", 
    "Glass_Break", "Siren_Alarm"
]

LABEL_MAPPING = {
    "Baby_Cry": {"id": "baby_cry", "label": "Плачещо бебе", "type": "warning", "threshold": 0.40},
    "Background": {"id": "background", "label": "Фонов шум", "type": "info", "threshold": 1.00},
    "Car_Horn": {"id": "car_horn", "label": "Клаксон", "type": "danger", "threshold": 0.60},
    "Construction": {"id": "construction", "label": "Ремонтни дейности", "type": "warning", "threshold": 0.85},
    "Dog_Bark": {"id": "dog_bark", "label": "Кучешки лай", "type": "warning", "threshold": 0.85},
    "Door_Signal": {"id": "door_signal", "label": "Звънец / Чукане", "type": "info", "threshold": 0.45},
    "Glass_Break": {"id": "glass_break", "label": "Счупено стъкло", "type": "danger", "threshold": 0.45},
    "Siren_Alarm": {"id": "siren_alarm", "label": "Сирена / Аларма", "type": "danger", "threshold": 0.60}
}

# Подразбиращи се настройки
DEFAULT_SETTINGS = {
    "notifications": True,
    "sound_recognition": True,
    "enabled_sounds": {
        "baby_cry": True, "car_horn": True, "construction": True,
        "dog_bark": True, "door_signal": True, "glass_break": True, "siren_alarm": True
    }
}
