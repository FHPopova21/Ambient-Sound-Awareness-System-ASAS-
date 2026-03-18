import psutil
import socket

def get_device_info():
    try:
        battery = psutil.sensors_battery()
        percent = battery.percent if battery else 100
        is_charging = battery.power_plugged if battery else False
        device_name = socket.gethostname()
        
        return {
            "device_name": device_name,
            "battery_percent": percent,
            "is_charging": is_charging
        }
    except Exception as e:
        print(f"Грешка при извличане на информация за устройството: {e}")
        return {
            "device_name": "Това устройство", 
            "battery_percent": 100, 
            "is_charging": False
        }
