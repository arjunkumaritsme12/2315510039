import argparse
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from dotenv import load_dotenv

from logging_middleware.logger import get_logger
from vehicle_scheduling.api_client import EvaluationApiClient
from vehicle_scheduling.scheduler import VehicleScheduler

load_dotenv()
logger = get_logger("vehicle_scheduling.main")


def main() -> int:
    parser = argparse.ArgumentParser(description="Run the vehicle maintenance scheduling optimization")
    parser.add_argument("--base-url", default=os.getenv("EVALUATION_BASE_URL", ""), help="Base URL for evaluation APIs")
    parser.add_argument("--token", default=os.getenv("EVALUATION_API_TOKEN", ""), help="Optional auth token")
    parser.add_argument("--header-name", default=os.getenv("EVALUATION_API_HEADER_NAME", "X-API-Key"), help="HTTP header used for auth")
    parser.add_argument("--output-dir", default=os.getenv("VEHICLE_OUTPUT_DIR", str(Path(__file__).resolve().parent / "output")), help="Directory for output JSON")
    args = parser.parse_args()

    client = EvaluationApiClient(base_url=args.base_url, api_token=args.token, header_name=args.header_name)
    scheduler = VehicleScheduler(api_client=client, output_dir=args.output_dir)
    results = scheduler.solve()
    logger.info("cli_execution_completed", extra={"function": "main", "status": "success", "result_count": len(results)})
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
