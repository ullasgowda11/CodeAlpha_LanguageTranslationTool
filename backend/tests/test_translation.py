import pytest
from app.schemas import TranslationRequest
from app.services.translation_service import translation_service


@pytest.mark.asyncio
async def test_supported_languages_list():
    """Verify supported languages catalog contains expected top languages."""
    languages = translation_service.get_supported_languages()
    assert len(languages) >= 30

    codes = [l.code for l in languages]
    assert "en" in codes
    assert "es" in codes
    assert "fr" in codes
    assert "de" in codes
    assert "hi" in codes
    assert "kn" in codes


@pytest.mark.asyncio
async def test_language_detection_english():
    """Verify language detection correctly identifies English."""
    result = await translation_service.detect_language("Welcome to the CodeAlpha Artificial Intelligence Internship.")
    assert result.detected_lang == "en"
    assert result.confidence > 0.6


@pytest.mark.asyncio
async def test_language_detection_spanish():
    """Verify language detection correctly identifies Spanish."""
    result = await translation_service.detect_language("Hola mundo, bienvenidos al curso de inteligencia artificial.")
    assert result.detected_lang == "es"


@pytest.mark.asyncio
async def test_real_translation_english_to_spanish():
    """Verify real end-to-end translation from English to Spanish."""
    req = TranslationRequest(
        text="Hello, how are you today?",
        source_lang="en",
        target_lang="es",
    )
    res = await translation_service.translate(req)
    assert res.translated_text is not None
    assert len(res.translated_text) > 0
    # Expected Spanish translation contains "Hola" or "cómo estás"
    assert any(term in res.translated_text.lower() for term in ["hola", "cómo", "como", "estás", "estas"])
    assert res.source_lang == "en"
    assert res.target_lang == "es"
    assert res.char_count == len(req.text)
    assert res.processing_time_ms > 0


@pytest.mark.asyncio
async def test_real_translation_auto_detection():
    """Verify translation with auto source detection."""
    req = TranslationRequest(
        text="Bonjour tout le monde",
        source_lang="auto",
        target_lang="en",
    )
    res = await translation_service.translate(req)
    assert "hello" in res.translated_text.lower() or "good morning" in res.translated_text.lower() or "everyone" in res.translated_text.lower()
    assert res.detected_source_lang == "fr"

