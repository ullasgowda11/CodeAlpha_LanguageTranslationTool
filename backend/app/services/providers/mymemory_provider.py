import html
import logging
from typing import Optional, Tuple
import httpx
from .base_provider import BaseTranslationProvider

logger = logging.getLogger(__name__)


class MyMemoryProvider(BaseTranslationProvider):
    """
    MyMemory Translation API Provider (by Translated.net).
    Provides free, highly reliable machine and human-curated translations
    supporting 100+ global languages using direct REST endpoints.
    """

    name: str = "mymemory"
    ENDPOINT = "https://api.mymemory.translated.net/get"

    def __init__(self, email: Optional[str] = None):
        self.email = email

    def is_available(self) -> bool:
        return True

    async def translate(
        self, text: str, source_lang: str, target_lang: str
    ) -> Tuple[str, Optional[str]]:
        src = "en" if source_lang.lower() in ("auto", "detect", "") else source_lang.lower()
        tgt = target_lang.lower()

        params = {
            "q": text,
            "langpair": f"{src}|{tgt}",
        }
        if self.email and "@" in self.email:
            params["de"] = self.email

        async with httpx.AsyncClient(timeout=12.0) as client:
            headers = {"User-Agent": "CodeAlphaTranslationTool/1.0"}
            resp = await client.get(self.ENDPOINT, params=params, headers=headers)
            resp.raise_for_status()
            data = resp.json()

            response_data = data.get("responseData")
            if not response_data or not response_data.get("translatedText"):
                raise RuntimeError(f"MyMemory translation returned empty: {data.get('responseDetails')}")

            # Unescape any HTML entities returned by the API
            raw_translation = response_data.get("translatedText")
            translated = html.unescape(raw_translation)

            # Check if response was an error message
            if data.get("responseStatus") not in (200, "200"):
                detail = data.get("responseDetails", "Translation error")
                raise RuntimeError(f"MyMemory API status {data.get('responseStatus')}: {detail}")

            return translated, src

    async def detect_language(self, text: str) -> Tuple[str, float]:
        return "en", 0.70
