import logging
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple
from langdetect import DetectorFactory, detect, detect_langs

from app.config import settings
from app.schemas import (
    LanguageDetectionResponse,
    LanguageItem,
    TranslationRequest,
    TranslationResponse,
)
from app.services.providers.base_provider import BaseTranslationProvider
from app.services.providers.deep_translator_provider import DeepGoogleProvider
from app.services.providers.google_cloud_provider import GoogleCloudProvider
from app.services.providers.mymemory_provider import MyMemoryProvider

logger = logging.getLogger(__name__)

# Enforce deterministic results in langdetect
DetectorFactory.seed = 0

SUPPORTED_LANGUAGES: List[Dict[str, any]] = [
    {"code": "en", "name": "English", "native_name": "English", "rtl": False, "flag": "🇺🇸"},
    {"code": "es", "name": "Spanish", "native_name": "Español", "rtl": False, "flag": "🇪🇸"},
    {"code": "fr", "name": "French", "native_name": "Français", "rtl": False, "flag": "🇫🇷"},
    {"code": "de", "name": "German", "native_name": "Deutsch", "rtl": False, "flag": "🇩🇪"},
    {"code": "hi", "name": "Hindi", "native_name": "हिन्दी", "rtl": False, "flag": "🇮🇳"},
    {"code": "kn", "name": "Kannada", "native_name": "ಕನ್ನಡ", "rtl": False, "flag": "🇮🇳"},
    {"code": "ta", "name": "Tamil", "native_name": "தமிழ்", "rtl": False, "flag": "🇮🇳"},
    {"code": "te", "name": "Telugu", "native_name": "తెలుగు", "rtl": False, "flag": "🇮🇳"},
    {"code": "ml", "name": "Malayalam", "native_name": "മലയാളം", "rtl": False, "flag": "🇮🇳"},
    {"code": "mr", "name": "Marathi", "native_name": "मराठी", "rtl": False, "flag": "🇮🇳"},
    {"code": "bn", "name": "Bengali", "native_name": "বাংলা", "rtl": False, "flag": "🇮🇳"},
    {"code": "gu", "name": "Gujarati", "native_name": "ગુજરાતી", "rtl": False, "flag": "🇮🇳"},
    {"code": "pa", "name": "Punjabi", "native_name": "ਪੰਜਾਬੀ", "rtl": False, "flag": "🇮🇳"},
    {"code": "zh", "name": "Chinese (Simplified)", "native_name": "简体中文", "rtl": False, "flag": "🇨🇳"},
    {"code": "ja", "name": "Japanese", "native_name": "日本語", "rtl": False, "flag": "🇯🇵"},
    {"code": "ko", "name": "Korean", "native_name": "한국어", "rtl": False, "flag": "🇰🇷"},
    {"code": "ar", "name": "Arabic", "native_name": "العربية", "rtl": True, "flag": "🇸🇦"},
    {"code": "ru", "name": "Russian", "native_name": "Русский", "rtl": False, "flag": "🇷🇺"},
    {"code": "pt", "name": "Portuguese", "native_name": "Português", "rtl": False, "flag": "🇵🇹"},
    {"code": "it", "name": "Italian", "native_name": "Italiano", "rtl": False, "flag": "🇮🇹"},
    {"code": "nl", "name": "Dutch", "native_name": "Nederlands", "rtl": False, "flag": "🇳🇱"},
    {"code": "tr", "name": "Turkish", "native_name": "Türkçe", "rtl": False, "flag": "🇹🇷"},
    {"code": "pl", "name": "Polish", "native_name": "Polski", "rtl": False, "flag": "🇵🇱"},
    {"code": "sv", "name": "Swedish", "native_name": "Svenska", "rtl": False, "flag": "🇸🇪"},
    {"code": "id", "name": "Indonesian", "native_name": "Bahasa Indonesia", "rtl": False, "flag": "🇮🇩"},
    {"code": "vi", "name": "Vietnamese", "native_name": "Tiếng Việt", "rtl": False, "flag": "🇻🇳"},
    {"code": "th", "name": "Thai", "native_name": "ไทย", "rtl": False, "flag": "🇹🇭"},
    {"code": "el", "name": "Greek", "native_name": "Ελληνικά", "rtl": False, "flag": "🇬🇷"},
    {"code": "cs", "name": "Czech", "native_name": "Čeština", "rtl": False, "flag": "🇨🇿"},
    {"code": "da", "name": "Danish", "native_name": "Dansk", "rtl": False, "flag": "🇩🇰"},
    {"code": "fi", "name": "Finnish", "native_name": "Suomi", "rtl": False, "flag": "🇫🇮"},
    {"code": "he", "name": "Hebrew", "native_name": "עברית", "rtl": True, "flag": "🇮🇱"},
    {"code": "ro", "name": "Romanian", "native_name": "Română", "rtl": False, "flag": "🇷🇴"},
    {"code": "uk", "name": "Ukrainian", "native_name": "Українська", "rtl": False, "flag": "🇺🇦"},
    {"code": "ur", "name": "Urdu", "native_name": "اردو", "rtl": True, "flag": "🇵🇰"},
    {"code": "fa", "name": "Persian", "native_name": "فارسی", "rtl": True, "flag": "🇮🇷"},
]

LANG_CODE_TO_NAME = {item["code"]: item["name"] for item in SUPPORTED_LANGUAGES}


class TranslationService:
    """
    Central orchestration service for language translation and detection.
    Features automated multi-provider fallback, language detection, and timing analytics.
    """

    def __init__(self):
        self.providers: Dict[str, BaseTranslationProvider] = {
            "google_free": DeepGoogleProvider(),
            "mymemory": MyMemoryProvider(email=settings.MYMEMORY_EMAIL),
            "google_cloud": GoogleCloudProvider(api_key=settings.GOOGLE_TRANSLATE_API_KEY),
        }

    def get_supported_languages(self) -> List[LanguageItem]:
        return [LanguageItem(**lang) for lang in SUPPORTED_LANGUAGES]

    def get_active_providers(self) -> List[str]:
        return [name for name, p in self.providers.items() if p.is_available()]

    async def detect_language(self, text: str) -> LanguageDetectionResponse:
        clean_text = text.strip()
        if not clean_text:
            return LanguageDetectionResponse(
                detected_lang="en",
                language_name="English",
                confidence=1.0,
                is_reliable=True,
            )

        # First attempt with langdetect
        try:
            detections = detect_langs(clean_text)
            if detections:
                top = detections[0]
                lang_code = top.lang
                confidence = float(top.prob)
                name = LANG_CODE_TO_NAME.get(lang_code, lang_code.upper())
                return LanguageDetectionResponse(
                    detected_lang=lang_code,
                    language_name=name,
                    confidence=round(confidence, 4),
                    is_reliable=confidence >= 0.7,
                )
        except Exception as e:
            logger.debug(f"langdetect fallback: {e}")

        # Fallback to provider detection
        provider = self.providers.get("google_free")
        code, conf = await provider.detect_language(clean_text)
        return LanguageDetectionResponse(
            detected_lang=code,
            language_name=LANG_CODE_TO_NAME.get(code, code.upper()),
            confidence=conf,
            is_reliable=conf >= 0.7,
        )

    async def translate(self, req: TranslationRequest) -> TranslationResponse:
        start_time = time.perf_counter()
        text = req.text.strip()
        src = req.source_lang.strip().lower()
        tgt = req.target_lang.strip().lower()

        # If source is auto, detect it first so provider gets proper code
        detected_src = None
        if src in ("auto", "detect", ""):
            det = await self.detect_language(text)
            detected_src = det.detected_lang
            src_for_provider = detected_src
        else:
            src_for_provider = src

        # Determine target provider preference order
        requested_provider = req.provider or settings.DEFAULT_PROVIDER
        fallback_order = [requested_provider, "mymemory", "google_free"]
        candidate_providers = []
        for p in fallback_order:
            if p in self.providers and p not in candidate_providers:
                candidate_providers.append(p)

        translated_text: Optional[str] = None
        provider_used = "none"
        last_error = None

        for p_name in candidate_providers:
            provider = self.providers.get(p_name)
            if not provider or not provider.is_available():
                continue
            try:
                translated_text, _ = await provider.translate(
                    text=text, source_lang=src_for_provider, target_lang=tgt
                )
                if translated_text:
                    provider_used = p_name
                    break
            except Exception as exc:
                logger.warning(f"Translation provider '{p_name}' failed: {exc}")
                last_error = exc

        if not translated_text:
            raise RuntimeError(
                f"Translation failed across all available providers. Last error: {last_error}"
            )

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        words = len(text.split())

        # If source was 'auto' and provider didn't return detected language, detect it now
        if src in ("auto", "detect", "") and not detected_src:
            det = await self.detect_language(text)
            detected_src = det.detected_lang

        return TranslationResponse(
            original_text=text,
            translated_text=translated_text,
            source_lang=src,
            target_lang=tgt,
            detected_source_lang=detected_src,
            provider_used=provider_used,
            char_count=len(text),
            word_count=words,
            processing_time_ms=round(elapsed_ms, 2),
            timestamp=datetime.now(timezone.utc).isoformat(),
        )


translation_service = TranslationService()
