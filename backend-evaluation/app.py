import os
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import JSONResponse

from logging_middleware.middleware import LoggingMiddleware
from notification_system.api_client import NotificationApiClient
from notification_system.stage6_priority_inbox import build_priority_inbox
from vehicle_scheduling.api_client import EvaluationApiClient
from vehicle_scheduling.scheduler import VehicleScheduler

load_dotenv()

app = FastAPI(title="Afford Medical Technologies Backend Evaluation")
app.add_middleware(LoggingMiddleware)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/vehicle-scheduling/solve")
def solve_vehicle_schedule() -> JSONResponse:
    client = EvaluationApiClient(base_url=os.getenv("EVALUATION_BASE_URL", ""))
    scheduler = VehicleScheduler(api_client=client, output_dir=Path(__file__).resolve().parent / "vehicle_scheduling" / "output")
    results = scheduler.solve()
    return JSONResponse(content={"results": results})


@app.get("/priority-inbox")
def priority_inbox() -> JSONResponse:
    client = NotificationApiClient(base_url=os.getenv("NOTIFICATION_BASE_URL", ""))
    notifications = client.fetch_notifications()
    ranked = build_priority_inbox(notifications, top_k=10)
    return JSONResponse(content={"notifications": ranked})
