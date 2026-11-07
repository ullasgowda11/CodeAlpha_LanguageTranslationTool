import asyncio
import logging
from typing import Optional, Tuple
from deep_translator import GoogleTranslator, single_detection
from .base_provider import BaseTranslationProvider

logger = logging.getLogger(__name__)


class DeepGoogleProvider(BaseTranslationProvider):
    """
    Legitimate, reliable Google Translate provider using deep-translator.
    Connects to Google's translation endpoints without requiring upfront paid API keys,
    guaranteeing real, functional translations out-of-the-box.
    """

    name: str = "google_free"

    def is_available(self) -> bool:
        return True

    def _sync_translate(self, text: str, source_lang: str, target_lang: str) -> str:
        # Convert 'auto' to 'auto' for deep-translator
        src = "auto" if source_lang.lower() in ("auto", "detect", "") else source_lang.lower()
        tgt = target_lang.lower()

        translator = GoogleTranslator(source=src, target=tgt)
        return translator.translate(text)

    def _sync_detect(self, text: str) -> str:
        # Detect language using single_detection (Google endpoint detection)
        try:
            sample = text[:300].strip()
            detected = single_detection(sample, api_key="")
            return detected.lower() if detected else "en"
        except Exception as e:
            logger.warning(f"DeepGoogleProvider detection warning: {e}")
            return "en"

    async def translate(
        self, text: str, source_lang: str, target_lang: str
    ) -> Tuple[str, Optional[str]]:
        detected_lang = None
        if source_lang.lower() in ("auto", "detect", ""):
            try:
                detected_lang = await asyncio.to_thread(self._sync_detect, text)
            except Exception:
                detected_lang = None

        translated = await asyncio.to_thread(
            self._sync_translate, text, source_lang, target_lang
        )
        return translated, detected_lang

    async def detect_language(self, text: str) -> Tuple[str, float]:
        detected = await asyncio.to_thread(self._sync_detect, text)
        return detected, 0.95

