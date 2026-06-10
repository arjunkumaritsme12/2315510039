from dataclasses import dataclass
from typing import Any


@dataclass(slots=True)
class Depot:
    id: int
    mechanic_hours: int

    @classmethod
    def from_payload(cls, payload: dict[str, Any]) -> "Depot":
        return cls(id=int(payload["ID"]), mechanic_hours=int(payload["MechanicHours"]))


@dataclass(slots=True)
class VehicleTask:
    task_id: str
    duration: int
    impact: int

    @classmethod
    def from_payload(cls, payload: dict[str, Any]) -> "VehicleTask":
        return cls(
            task_id=str(payload["TaskID"]),
            duration=int(payload["Duration"]),
            impact=int(payload["Impact"]),
        )
