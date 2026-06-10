import json
import os
import sys
from datetime import datetime, timezone
from heapq import heappop, heappush
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from logging_middleware.logger import get_logger
from notification_system.api_client import NotificationApiClient
from notification_system.models import NotificationItem

logger = get_logger("notification_system.priority_inbox")


def _parse_timestamp(value: str) -> datetime | None:
    if not value:
        return None
    normalized = value.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(normalized)
    except ValueError:
        return None


def _recency_bonus(timestamp: datetime | None) -> int:
    if timestamp is None:
        return 0
    age_days = (datetime.now(timezone.utc) - timestamp).total_seconds() / 86400
    if age_days <= 1:
        return 50
    if age_days <= 7:
        return 20
    return 0


def _score_notification(notification: NotificationItem) -> int:
    base_score = {"Placement": 100, "Result": 70, "Event": 40}.get(notification.notification_type, 40)
    return base_score + _recency_bonus(_parse_timestamp(notification.timestamp))


def build_priority_inbox(notifications: list[dict[str, Any]] | list[NotificationItem], top_k: int = 10) -> list[dict[str, Any]]:
    items = []
    for notification in notifications:
        if isinstance(notification, NotificationItem):
            item = notification
        else:
            item = NotificationItem.from_payload(notification)
        score = _score_notification(item)
        items.append((score, _parse_timestamp(item.timestamp) or datetime.min.replace(tzinfo=timezone.utc), item))

    heap: list[tuple[int, datetime, str, NotificationItem]] = []
    for score, timestamp, item in items:
        entry = (score, timestamp, item.notification_id, item)
        if len(heap) < top_k:
            heappush(heap, entry)
        elif entry[0] > heap[0][0] or (entry[0] == heap[0][0] and entry[1] > heap[0][1]):
            heappop(heap)
            heappush(heap, entry)

    ranked = [
        {
            "ID": item.notification_id,
            "Type": item.notification_type,
            "Message": item.message,
            "Timestamp": item.timestamp,
            "Score": score,
        }
        for score, _, _, item in heap
    ]
    ranked.sort(key=lambda row: (-row["Score"], row["Timestamp"]))
    ranked = ranked[:top_k]

    output_dir = Path(os.getenv("NOTIFICATION_OUTPUT_DIR", Path(__file__).resolve().parent / "output"))
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "priority_inbox_output.json"
    output_path.write_text(json.dumps(ranked, indent=2), encoding="utf-8")
    logger.info("priority_inbox_completed", extra={"function": "build_priority_inbox", "status": "success", "output_path": str(output_path)})
    return ranked


if __name__ == "__main__":
    client = NotificationApiClient(base_url=os.getenv("NOTIFICATION_BASE_URL", ""))
    notifications = client.fetch_notifications()
    build_priority_inbox(notifications)
