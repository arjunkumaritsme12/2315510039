from dataclasses import dataclass
from typing import Any


@dataclass(slots=True)
class NotificationItem:
    notification_id: str
    notification_type: str
    message: str
    timestamp: str

    @classmethod
    def from_payload(cls, payload: dict[str, Any]) -> "NotificationItem":
        return cls(
            notification_id=str(payload["ID"]),
            notification_type=str(payload.get("Type", "Event")),
            message=str(payload.get("Message", "")),
            timestamp=str(payload.get("Timestamp", "")),
        )
