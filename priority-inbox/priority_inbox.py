import requests
import heapq
import math
import logging
import os
from datetime import datetime, timezone

API_URL = "http://4.224.186.213/evaluation-service/notifications"

ACCESS_CODE = "RPsgYt"
ACCESS_TOKEN = "YOUR_ACCESS_TOKEN"

TYPE_WEIGHTS = {
    "Placement": 3,
    "Result": 2,
    "Event": 1
}

DECAY_LAMBDA = 0.1
TOP_N = 10

log_dir = os.path.join(os.path.dirname(__file__), "logs")
os.makedirs(log_dir, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(os.path.join(log_dir, "priority_inbox.log")),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("priority_inbox")


def fetch_notifications():
    logger.info(f"Fetching notifications from {API_URL}")

    all_notifications = []
    page = 1
    limit = 100

    while True:
        try:
            response = requests.get(
                API_URL,
                params={
                    "page": page,
                    "limit": limit,
                    "access_code": ACCESS_CODE,
                    "access_token": ACCESS_TOKEN
                },
                timeout=15
            )

            logger.info(f"Page {page} Status Code: {response.status_code}")

            if response.status_code != 200:
                logger.error(response.text)
                break

            data = response.json()

            notifications = (
                data.get("notifications")
                or data.get("data")
                or []
            )

            if not notifications:
                logger.info("No more notifications found")
                break

            all_notifications.extend(notifications)

            logger.info(
                f"Fetched {len(notifications)} notifications from page {page}"
            )

            page += 1

        except Exception as e:
            logger.error(f"Error on page {page}: {e}")
            break

    return all_notifications


def calculate_priority_score(notification):
    notification_type = (
        notification.get("type")
        or notification.get("Type")
        or "Event"
    )

    timestamp_str = (
        notification.get("timestamp")
        or notification.get("Timestamp")
        or ""
    )

    weight = TYPE_WEIGHTS.get(notification_type, 1)

    try:
        created_at = datetime.fromisoformat(
            timestamp_str.replace("Z", "+00:00")
        )

        now = datetime.now(timezone.utc)

        hours_elapsed = (
            now - created_at
        ).total_seconds() / 3600

    except Exception:
        hours_elapsed = 0

    recency_factor = math.exp(
        -DECAY_LAMBDA * hours_elapsed
    )

    return weight * recency_factor


def get_top_n_priority(notifications, n=TOP_N):
    heap = []

    for idx, notification in enumerate(notifications):
        score = calculate_priority_score(notification)

        if len(heap) < n:
            heapq.heappush(
                heap,
                (score, idx, notification)
            )

        elif score > heap[0][0]:
            heapq.heapreplace(
                heap,
                (score, idx, notification)
            )

    result = sorted(
        heap,
        key=lambda x: x[0],
        reverse=True
    )

    return [
        (score, notif)
        for score, _, notif in result
    ]


def display_results(top_notifications):
    print("\n" + "=" * 90)

    print(
        f"{'RANK':<6}"
        f"{'SCORE':<12}"
        f"{'TYPE':<15}"
        f"{'MESSAGE':<35}"
        f"{'TIMESTAMP'}"
    )

    print("-" * 90)

    for rank, (score, notif) in enumerate(
        top_notifications,
        start=1
    ):
        notif_type = (
            notif.get("type")
            or notif.get("Type")
            or "N/A"
        )

        message = (
            notif.get("message")
            or notif.get("Message")
            or "N/A"
        )

        timestamp = (
            notif.get("timestamp")
            or notif.get("Timestamp")
            or "N/A"
        )

        print(
            f"{rank:<6}"
            f"{score:<12.4f}"
            f"{notif_type:<15}"
            f"{message[:30]:<35}"
            f"{timestamp}"
        )

    print("=" * 90)


def add_new_notification(heap, notification, n=TOP_N):
    score = calculate_priority_score(notification)

    item = (
        score,
        id(notification),
        notification
    )

    if len(heap) < n:
        heapq.heappush(heap, item)

    elif score > heap[0][0]:
        heapq.heapreplace(heap, item)

    return heap


if __name__ == "__main__":
    logger.info("=" * 50)
    logger.info("Priority Inbox Started")
    logger.info("=" * 50)

    notifications = fetch_notifications()

    if not notifications:
        logger.error("No notifications fetched")
        exit()

    logger.info(
        f"Total notifications fetched: {len(notifications)}"
    )

    top_notifications = get_top_n_priority(
        notifications,
        TOP_N
    )

    display_results(top_notifications)

    current_heap = []

    for score, notif in top_notifications:
        current_heap.append(
            (score, id(notif), notif)
        )

    heapq.heapify(current_heap)

    new_notification = {
        "id": "demo",
        "type": "Placement",
        "message": "OpenAI urgent hiring",
        "timestamp": datetime.now(
            timezone.utc
        ).isoformat()
    }

    add_new_notification(
        current_heap,
        new_notification
    )

    updated = sorted(
        current_heap,
        key=lambda x: x[0],
        reverse=True
    )

    print("\nAfter New Notification:\n")

    display_results(
        [
            (score, notif)
            for score, _, notif in updated
        ]
    )