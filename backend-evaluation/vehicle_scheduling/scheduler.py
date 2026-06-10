import json
import os
from pathlib import Path
from typing import Any

from logging_middleware.logger import get_logger
from .api_client import EvaluationApiClient
from .models import Depot, VehicleTask

logger = get_logger("vehicle_scheduling.scheduler")


class VehicleScheduler:
    def __init__(self, api_client: EvaluationApiClient | None = None, output_dir: str | Path | None = None) -> None:
        self.api_client = api_client or EvaluationApiClient()
        self.output_dir = Path(output_dir or os.getenv("VEHICLE_OUTPUT_DIR", Path(__file__).resolve().parent / "output"))
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def solve(self, depots: list[dict[str, Any]] | list[Depot] | None = None, vehicles: list[dict[str, Any]] | list[VehicleTask] | None = None) -> list[dict[str, Any]]:
        depots_models = self._coerce_depots(depots or self.api_client.fetch_depots())
        vehicles_models = self._coerce_vehicles(vehicles or self.api_client.fetch_vehicles())

        results: list[dict[str, Any]] = []
        for depot in depots_models:
            selected_ids, total_duration, total_impact = self._knapsack(depot.mechanic_hours, vehicles_models)
            results.append(
                {
                    "depot_id": depot.id,
                    "mechanic_hours": depot.mechanic_hours,
                    "selected_tasks": selected_ids,
                    "total_duration": total_duration,
                    "total_impact": total_impact,
                }
            )

        output_path = self.output_dir / "vehicle_schedule_results.json"
        output_path.write_text(json.dumps(results, indent=2), encoding="utf-8")
        logger.info(
            "scheduler_completed",
            extra={"function": "solve", "status": "success", "depot_count": len(results), "output_path": str(output_path)},
        )
        return results

    def _coerce_depots(self, depots: list[dict[str, Any]] | list[Depot]) -> list[Depot]:
        if not depots:
            return []
        if isinstance(depots[0], Depot):
            return list(depots)
        return [Depot.from_payload(item) for item in depots]

    def _coerce_vehicles(self, vehicles: list[dict[str, Any]] | list[VehicleTask]) -> list[VehicleTask]:
        if not vehicles:
            return []
        if isinstance(vehicles[0], VehicleTask):
            return list(vehicles)
        return [VehicleTask.from_payload(item) for item in vehicles]

    def _knapsack(self, capacity: int, vehicles: list[VehicleTask]) -> tuple[list[str], int, int]:
        dp = [[0 for _ in range(capacity + 1)] for _ in range(len(vehicles) + 1)]
        take = [[False for _ in range(capacity + 1)] for _ in range(len(vehicles) + 1)]

        for idx in range(1, len(vehicles) + 1):
            vehicle = vehicles[idx - 1]
            for current_capacity in range(1, capacity + 1):
                skip_value = dp[idx - 1][current_capacity]
                take_value = 0
                if vehicle.duration <= current_capacity:
                    take_value = vehicle.impact + dp[idx - 1][current_capacity - vehicle.duration]
                if take_value > skip_value:
                    dp[idx][current_capacity] = take_value
                    take[idx][current_capacity] = True
                else:
                    dp[idx][current_capacity] = skip_value

        selected_ids: list[str] = []
        remaining_capacity = capacity
        for idx in range(len(vehicles), 0, -1):
            if take[idx][remaining_capacity]:
                vehicle = vehicles[idx - 1]
                selected_ids.append(vehicle.task_id)
                remaining_capacity -= vehicle.duration

        selected_ids.reverse()
        return selected_ids, sum(vehicle.duration for vehicle in vehicles if vehicle.task_id in selected_ids), dp[len(vehicles)][capacity]
