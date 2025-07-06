from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class NotificationDevice:
    user_id: str
    player_id: str
    platform: str = "web"
    last_used: datetime = field(default_factory=datetime.now)

    def to_dict(self) -> dict:
        return {
            "user_id": self.user_id,
            "player_id": self.player_id,
            "platform": self.platform,
            "last_used": self.last_used,
        }
