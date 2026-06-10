import os
import sys
from pathlib import Path
from typing import Any

import requests
from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from logging_middleware.logger import get_logger
from .models import NotificationItem

load_dotenv()

logger = get_logger("notification_system.api_client")


class NotificationApiClient:
    def __init__(self, base_url: str | None = None, api_token: str | None = None, header_name: str | None = None) -> None:
        self.base_url = (base_url or os.getenv("NOTIFICATION_BASE_URL", "")).rstrip("/")
        self.api_token = api_token or os.getenv("NOTIFICATION_API_TOKEN", "")
        self.header_name = header_name or os.getenv("NOTIFICATION_API_HEADER_NAME", "X-API-Key")
        self.timeout = int(os.getenv("NOTIFICATION_TIMEOUT", "5"))
        self.session = requests.Session()

    def _build_headers(self) -> dict[str, str]:
        headers = {"Accept": "application/json"}
        if self.api_token:
            if self.header_name.lower() == "authorization":
                headers[self.header_name] = f"Bearer {self.api_token}"
            else:
                headers[self.header_name] = self.api_token
        return headers

    def fetch_notifications(self) -> list[NotificationItem]:
        if not self.base_url:
            logger.warning("notification_base_url_not_configured", extra={"function": "fetch_notifications", "status": "fallback"})
            return [
                NotificationItem("n1", "Placement", "Welcome placement update", "2026-06-10T09:00:00Z"),
                NotificationItem("n2", "Result", "Result published", "2026-06-02T10:00:00Z"),
                NotificationItem("n3", "Event", "Campus career fair", "2026-06-08T10:00:00Z"),
            ]
        try:
            response = self.session.get(f"{self.base_url}/notifications", headers=self._build_headers(), timeout=self.timeout)
            response.raise_for_status()
            payload = response.json()
            notifications = payload.get("notifications", []) if isinstance(payload, dict) else []
            return [NotificationItem.from_payload(item) for item in notifications]
        except requests.RequestException as exc:
            logger.exception(
                "notification_request_failed",
                extra={"function": "fetch_notifications", "status": "fallback", "error": str(exc)},
            )
            return [
                NotificationItem("n1", "Placement", "Welcome placement update", "2026-06-10T09:00:00Z"),
                NotificationItem("n2", "Result", "Result published", "2026-06-02T10:00:00Z"),
                NotificationItem("n3", "Event", "Campus career fair", "2026-06-08T10:00:00Z"),
            ]
