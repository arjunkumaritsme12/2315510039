import json
import logging
import os
import uuid
from contextvars import ContextVar
from datetime import datetime, timezone
from typing import Any, Optional

request_id_context: ContextVar[Optional[str]] = ContextVar("request_id", default=None)


class StructuredJsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": getattr(record, "request_id", request_id_context.get()),
            "function": getattr(record, "function", None),
            "status": getattr(record, "status", None),
            "error": getattr(record, "error", None),
            "execution_time_ms": getattr(record, "execution_time_ms", None),
        }
        return json.dumps({k: v for k, v in payload.items() if v is not None}, default=str)


def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(StructuredJsonFormatter())
        logger.addHandler(handler)
    logger.setLevel(os.getenv("LOG_LEVEL", "INFO").upper())
    logger.propagate = False
    return logger


def bind_request_id(request_id: Optional[str]) -> None:
    request_id_context.set(request_id)


def clear_request_id() -> None:
    request_id_context.set(None)


def build_request_id() -> str:
    return str(uuid.uuid4())
