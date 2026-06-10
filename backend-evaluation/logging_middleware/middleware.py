import time
import uuid
from contextvars import ContextVar
from typing import Callable

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from .logger import bind_request_id, clear_request_id, get_logger

logger = get_logger("logging_middleware")


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
        bind_request_id(request_id)
        started = time.perf_counter()
        try:
            response = await call_next(request)
            elapsed_ms = round((time.perf_counter() - started) * 1000, 2)
            logger.info(
                "request_completed",
                extra={
                    "request_id": request_id,
                    "function": f"{request.method} {request.url.path}",
                    "status": response.status_code,
                    "execution_time_ms": elapsed_ms,
                },
            )
            return response
        except Exception as exc:  # pragma: no cover - defensive logging
            elapsed_ms = round((time.perf_counter() - started) * 1000, 2)
            logger.exception(
                "request_failed",
                extra={
                    "request_id": request_id,
                    "function": f"{request.method} {request.url.path}",
                    "status": 500,
                    "error": str(exc),
                    "execution_time_ms": elapsed_ms,
                },
            )
            raise
        finally:
            clear_request_id()
