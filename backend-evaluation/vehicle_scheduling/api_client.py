import os
from typing import Any

import requests
from dotenv import load_dotenv

from logging_middleware.logger import get_logger
from .models import Depot, VehicleTask

load_dotenv()

logger = get_logger("vehicle_scheduling.api_client")


class EvaluationApiClient:
    def __init__(self, base_url: str | None = None, api_token: str | None = None, header_name: str | None = None) -> None:
        self.base_url = (base_url or os.getenv("EVALUATION_BASE_URL", "")).rstrip("/")
        self.api_token = api_token or os.getenv("EVALUATION_API_TOKEN", "")
        self.header_name = header_name or os.getenv("EVALUATION_API_HEADER_NAME", "X-API-Key")
        self.timeout = int(os.getenv("EVALUATION_TIMEOUT", "5"))
        self.session = requests.Session()

    def _build_headers(self) -> dict[str, str]:
        headers = {"Accept": "application/json"}
        if self.api_token:
            if self.header_name.lower() == "authorization":
                headers[self.header_name] = f"Bearer {self.api_token}"
            else:
                headers[self.header_name] = self.api_token
        return headers

    def _perform_request(self, path: str, fallback: Any) -> Any:
        if not self.base_url:
            logger.warning("evaluation_base_url_not_configured", extra={"function": "_perform_request", "status": "fallback"})
            return fallback
        try:
            response = self.session.get(f"{self.base_url}{path}", headers=self._build_headers(), timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as exc:
            logger.exception(
                "evaluation_request_failed",
                extra={"function": "_perform_request", "status": "fallback", "error": str(exc)},
            )
            return fallback

    def fetch_depots(self) -> list[Depot]:
        payload = self._perform_request("/depots", {"depots": [{"ID": 1, "MechanicHours": 60}]})
        depots = payload.get("depots", []) if isinstance(payload, dict) else []
        return [Depot.from_payload(item) for item in depots]

    def fetch_vehicles(self) -> list[VehicleTask]:
        payload = self._perform_request(
            "/vehicles",
            {
                "vehicles": [
                    {"TaskID": "vehicle-1", "Duration": 4, "Impact": 18},
                    {"TaskID": "vehicle-2", "Duration": 6, "Impact": 20},
                    {"TaskID": "vehicle-3", "Duration": 3, "Impact": 15},
                    {"TaskID": "vehicle-4", "Duration": 8, "Impact": 25},
                ]
            },
        )
        vehicles = payload.get("vehicles", []) if isinstance(payload, dict) else []
        return [VehicleTask.from_payload(item) for item in vehicles]
