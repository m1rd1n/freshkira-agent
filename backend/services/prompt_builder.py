import logging
from pathlib import Path

logger = logging.getLogger(__name__)

_knowledge_cache: dict[str, str] = {}
_system_prompt: str = ""

KB_DIR = Path(__file__).parent.parent / "knowledge"
PROMPT_FILE = Path(__file__).parent.parent / "prompts" / "system_prompt.md"

KB_FILES = {
    "KB1": "KB1_FreshKira_Product_Catalogue.md",
    "KB2": "KB2_FreshKira_Brand_Tone_Guide.md",
    "KB3": "KB3_Competitor_Pricing_Sheet.md",
    "KB4": "KB4_Malaysian_Ecommerce_Calendar.md",
}

KB_TITLES = {
    "KB1": "FreshKira Product Catalogue",
    "KB2": "Brand Tone Guide",
    "KB3": "Competitor Pricing Sheet",
    "KB4": "Malaysian E-Commerce Calendar",
}

MODE_TRIGGERS = {
    "TREND_SCAN": "TREND SCAN",
    "PRICE_REVIEW": "PRICE REVIEW",
    "ROI_CHECK": "ROI CHECK",
}


def load_knowledge_base() -> None:
    global _system_prompt, _knowledge_cache

    if PROMPT_FILE.exists():
        _system_prompt = PROMPT_FILE.read_text(encoding="utf-8").rstrip()
        logger.info(
            "System prompt loaded (%d chars).", len(_system_prompt)
        )
    else:
        logger.warning(
            "system_prompt.md not found at %s — agent will run without it.", PROMPT_FILE
        )

    loaded = 0
    for key, filename in KB_FILES.items():
        path = KB_DIR / filename
        if path.exists():
            content = path.read_text(encoding="utf-8").rstrip()
            _knowledge_cache[key] = content
            logger.info("%s loaded (%d chars).", filename, len(content))
            loaded += 1
        else:
            logger.warning("%s not found at %s — skipping.", filename, path)

    logger.info("Knowledge base ready: %d/%d files loaded.", loaded, len(KB_FILES))


def build_system_message() -> str:
    """Assemble the full system message: base prompt + all cached KB files."""
    parts: list[str] = [_system_prompt]

    if _knowledge_cache:
        parts.append("\n\n---\n## KNOWLEDGE BASE\n")
        for key, content in _knowledge_cache.items():
            title = KB_TITLES.get(key, key)
            parts.append(f"\n### {key}: {title}\n\n{content}")

    # Use "" join — each part already carries its own leading/trailing newlines
    return "".join(parts)


def build_user_message(mode: str, user_input: str) -> str:
    trigger = MODE_TRIGGERS.get(mode, mode)
    # Wrap input in explicit delimiters so the model treats it as data, not instructions
    return (
        f"{trigger}:\n\n"
        f"<user_data>\n"
        f"{user_input}\n"
        f"</user_data>"
    )
