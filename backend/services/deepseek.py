import logging
import os
from typing import AsyncGenerator

import openai
from openai import AsyncOpenAI

from services.prompt_builder import build_system_message, build_user_message

logger = logging.getLogger(__name__)

MODEL_MAP = {
    "TREND_SCAN": "deepseek-chat",
    "PRICE_REVIEW": "deepseek-chat",
    "ROI_CHECK": "deepseek-reasoner",
}

MAX_TOKENS_MAP = {
    "deepseek-chat": 4096,
    "deepseek-reasoner": 8192,
}

# Lazy singleton — created on first request so dotenv is loaded beforehand
_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        api_key = os.getenv("DEEPSEEK_API_KEY")
        if not api_key:
            raise RuntimeError("DEEPSEEK_API_KEY environment variable is not set")
        _client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://api.deepseek.com",
            timeout=30.0,
        )
        logger.info("DeepSeek client initialised.")
    return _client


async def stream_agent_response(
    mode: str, user_input: str
) -> AsyncGenerator[dict, None]:
    model = MODEL_MAP.get(mode, "deepseek-chat")
    max_tokens = MAX_TOKENS_MAP[model]

    system_message = build_system_message()
    user_message = build_user_message(mode, user_input)

    logger.info("Agent request — mode=%s model=%s input_len=%d", mode, model, len(user_input))

    kwargs: dict = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message},
        ],
        "max_tokens": max_tokens,
        "stream": True,
    }

    # R1 (deepseek-reasoner) does not support temperature — omit it
    if model == "deepseek-chat":
        kwargs["temperature"] = 0.7

    try:
        client = _get_client()
        stream = await client.chat.completions.create(**kwargs)

        token_count = 0
        async for chunk in stream:
            if not chunk.choices:
                continue
            delta = chunk.choices[0].delta

            # Explicitly skip reasoning_content (R1 chain-of-thought) — only stream content
            content = getattr(delta, "content", None)
            if content:
                token_count += 1
                yield {"content": content, "done": False}

        logger.info("Stream complete — mode=%s tokens_yielded=%d", mode, token_count)
        yield {"content": "", "done": True}

    except RuntimeError as e:
        # Missing API key
        logger.error("Configuration error: %s", e)
        yield {"content": str(e), "done": True}

    except openai.APIStatusError as e:
        if e.status_code == 429:
            logger.warning("DeepSeek rate limit hit.")
            yield {
                "content": "The AI model is currently busy. Please try again in 30 seconds.",
                "done": True,
            }
        else:
            logger.error("DeepSeek API error %d: %s", e.status_code, e.message)
            yield {
                "content": f"API error ({e.status_code}): {e.message}",
                "done": True,
            }

    except openai.APITimeoutError:
        logger.warning("DeepSeek request timed out after 30s.")
        yield {
            "content": "The request timed out after 30 seconds. Please try again.",
            "done": True,
        }

    except openai.APIConnectionError as e:
        logger.error("DeepSeek connection error: %s", e)
        yield {
            "content": "Could not connect to the AI service. Please check your connection and try again.",
            "done": True,
        }

    except Exception as e:
        logger.exception("Unexpected error in stream_agent_response")
        yield {"content": f"An unexpected error occurred: {e}", "done": True}
