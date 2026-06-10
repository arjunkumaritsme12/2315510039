from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from notification_system.stage6_priority_inbox import build_priority_inbox


def test_priority_inbox_returns_top_ten():
    notifications = [
        {"ID": "a", "Type": "Placement", "Message": "m1", "Timestamp": "2026-06-09T10:00:00Z"},
        {"ID": "b", "Type": "Event", "Message": "m2", "Timestamp": "2026-06-08T10:00:00Z"},
        {"ID": "c", "Type": "Result", "Message": "m3", "Timestamp": "2026-06-01T10:00:00Z"},
    ]

    top = build_priority_inbox(notifications, top_k=2)

    assert len(top) == 2
    assert top[0]["ID"] == "a"
    assert top[1]["ID"] == "c"
