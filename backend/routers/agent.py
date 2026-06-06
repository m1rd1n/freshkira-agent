import json
import logging
from typing import AsyncGenerator

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, field_validator

from services.deepseek import stream_agent_response

logger = logging.getLogger(__name__)
router = APIRouter()

VALID_MODES = {"TREND_SCAN", "PRICE_REVIEW", "ROI_CHECK"}
MAX_INPUT_LENGTH = 5000


class AgentRequest(BaseModel):
    mode: str
    userInput: str

    @field_validator("mode")
    @classmethod
    def validate_mode(cls, v: str) -> str:
        if v not in VALID_MODES:
            raise ValueError(f"mode must be one of {sorted(VALID_MODES)}")
        return v

    @field_validator("userInput")
    @classmethod
    def validate_user_input(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("userInput must not be empty")
        return v


async def _event_stream(
    mode: str, user_input: str, http_request: Request
) -> AsyncGenerator[str, None]:
    try:
        async for chunk in stream_agent_response(mode, user_input):
            # Stop generating if the client has already disconnected
            if await http_request.is_disconnected():
                logger.info("Client disconnected — stopping stream for mode=%s.", mode)
                break
            yield f"data: {json.dumps(chunk)}\n\n"
    except Exception:
        logger.exception("Unhandled error in SSE generator for mode=%s", mode)
        error_event = {"content": "Stream error. Please try again.", "done": True}
        yield f"data: {json.dumps(error_event)}\n\n"


@router.post("/agent")
async def run_agent(http_request: Request, body: AgentRequest):
    if len(body.userInput) > MAX_INPUT_LENGTH:
        raise HTTPException(
            status_code=413,
            detail=f"userInput exceeds {MAX_INPUT_LENGTH} characters",
        )

    logger.info("POST /api/agent — mode=%s", body.mode)

    return StreamingResponse(
        _event_stream(body.mode, body.userInput, http_request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # disable nginx buffering
        },
    )
