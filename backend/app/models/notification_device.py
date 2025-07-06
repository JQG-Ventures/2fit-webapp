"""
Defines the NotificationDevice data model used for storing OneSignal player IDs
linked to user accounts for push notifications.
"""

from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class NotificationDevice:
    """
    Represents a notification device registered for push notifications.

    Attributes:
        user_id (str): The ID of the user owning the device.
        player_id (str): The OneSignal player ID for the device.
        platform (str): The platform of the device (e.g., "web", "android", "ios").
        Defaults to "web".
        last_used (datetime): Timestamp of the last usage of the device.
    """

    user_id: str
    player_id: str
    platform: str = "web"
    last_used: datetime = field(default_factory=datetime.now)

    def to_dict(self) -> dict:
        """
        Convert the NotificationDevice instance into a dictionary for storage in MongoDB.

        Returns:
            dict: Dictionary representation of the notification device.
        """
        return {
            "user_id": self.user_id,
            "player_id": self.player_id,
            "platform": self.platform,
            "last_used": self.last_used,
        }
