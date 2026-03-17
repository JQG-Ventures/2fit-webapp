from datetime import datetime

import requests
from sqlalchemy import select

import app.settings as s
from app.celery import celery_app
from app.extensions import db
from app.models.notification import NotificationDevice


@celery_app.task(name="send_water_reminder")
def send_water_reminder() -> None:
    print("Running water reminder task...")

    from app import create_app

    app = create_app()
    with app.app_context():
        devices = db.session.scalars(select(NotificationDevice)).all()

        for device in devices:
            player_id = device.player_id

            payload = {
                "app_id": s.ONESIGNAL_APP_ID,
                "include_player_ids": [player_id],
                "headings": {"en": "Ya tomaste agua?"},
                "contents": {"en": "Hidratarte bien mejora tu rendimiento fisico"},
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
            except Exception as e:
                print(f"[{datetime.now()}] Failed to send to {player_id}: {e}")
