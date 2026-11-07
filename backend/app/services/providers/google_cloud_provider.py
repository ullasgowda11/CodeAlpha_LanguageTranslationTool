import httpx
import logging
from typing import Optional, Tuple
from .base_provider import BaseTranslationProvider

logger = logging.getLogger(__name__)


class GoogleCloudProvider(BaseTranslationProvider):
    """
    Official Google Cloud Translation API Provider (Cloud Translation v2/v3).
    Activated when GOOGLE_TRANSLATE_API_KEY is configured in .env.
    Uses official Google Cloud Translation REST endpoints.
    """

    name: str = "google_cloud"
    ENDPOINT = "https://translation.googleapis.com/language/translate/v2"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key

    def is_available(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 10)

    async def translate(
        self, text: str, source_lang: str, target_lang: str
    ) -> Tuple[str, Optional[str]]:
        if not self.is_available():
            raise RuntimeError(
                "Google Cloud Translation API key is not configured. "
                "Set GOOGLE_TRANSLATE_API_KEY in backend/.env"
            )

        params = {
            "q": text,
            "target": target_lang,
            "key": self.api_key,
            "format": "text",
        }
        if source_lang.lower() not in ("auto", "detect", ""):
            params["source"] = source_lang

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(self.ENDPOINT, params=params)
            resp.raise_for_status()
            data = resp.json()

            translations = data.get("data", {}).get("translations", [])
            if not translations:
                raise RuntimeError("No translation returned by Google Cloud API")

            first = translations[0]
            translated_text = first.get("translatedText", "")
            detected_source = first.get("detectedSourceLanguage")

            return translated_text, detected_source

    async def detect_language(self, text: str) -> Tuple[str, float]:
        if not self.is_available():
            raise RuntimeError("Google Cloud Translation API key not configured")

        detect_endpoint = "https://translation.googleapis.com/language/translate/v2/detect"
        params = {"q": text[:300], "key": self.api_key}

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(detect_endpoint, params=params)
            resp.raise_for_status()
            data = resp.json()
            detections = data.get("data", {}).get("detections", [[]])[0]
            if detections:
                lang = detections[0].get("language", "en")
                confidence = float(detections[0].get("confidence", 0.90))
                return lang, confidence
            return "en", 0.5

