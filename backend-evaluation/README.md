# Afford Medical Technologies Backend Evaluation

This project contains a production-ready Python implementation for the evaluation task using FastAPI, structured logging, a vehicle maintenance scheduling optimizer, and a priority inbox ranking workflow.

## Project Structure

- `logging_middleware/` — reusable JSON logging middleware and helpers
- `vehicle_scheduling/` — depot and vehicle scheduling logic, API client, CLI entry point, and sample output
- `notification_system/` — design document, notification API client, and priority inbox implementation
- `tests/` — verification tests for the scheduler and priority inbox logic

## Run the API

```bash
cd backend-evaluation
pip install -r requirements.txt
uvicorn app:app --reload
```

## Run the Scheduler CLI

```bash
cd backend-evaluation
python vehicle_scheduling/main.py
```

## Run the Priority Inbox Script

```bash
cd backend-evaluation
python notification_system/stage6_priority_inbox.py
```

## Notes

- Authentication is optional and controlled through environment variables.
- Protected route headers are configurable using `EVALUATION_API_HEADER_NAME` and `NOTIFICATION_API_HEADER_NAME`.
- The code uses structured logging and avoids print statements.
