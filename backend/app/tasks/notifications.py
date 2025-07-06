from app.celery import celery_app
from app.extensions import mongo
from datetime import datetime

import app.settings as s
import requests


@celery_app.task(name="send_water_reminder")
def send_water_reminder():
    print("Running water reminder task...")

    devices = mongo.db.notification_devices.find({})

    for device in devices:
        player_id = device["player_id"]

        payload = {
            "app_id": s.ONESIGNAL_APP_ID,
            "include_player_ids": [player_id],
            "headings": {"en": "💧 ¿Ya tomaste agua?"},
            "contents": {"en": "Hidratarte bien mejora tu rendimiento físico 🧠💪"},
        }

        headers = {
            "Authorization": f"Basic {s.ONESIGNAL_REST_API_KEY}",
            "Content-Type": "application/json",
        }

        try:
            response = requests.post(
                "https://onesignal.com/api/v1/notifications", json=payload, headers=headers
            )
            print(f"[{datetime.now()}] Sent to {player_id}: {response.status_code}")
            print(f"[{datetime.now()}] Payload: {payload}")
            print(f"[{datetime.now()}] Response: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"[{datetime.now()}] Failed to send to {player_id}: {e}")
