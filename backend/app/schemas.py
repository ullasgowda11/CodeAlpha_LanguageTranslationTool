from typing import List, Optional
from pydantic import BaseModel, Field


class TranslationRequest(BaseModel):
    """Schema for translation requests."""
    text: str = Field(..., min_length=1, max_length=10000, description="Text to translate")
    source_lang: str = Field(default="auto", description="Source language code or 'auto'")
    target_lang: str = Field(..., min_length=2, description="Target language code (e.g. 'es', 'fr', 'hi')")
    provider: Optional[str] = Field(default=None, description="Optional override of translation provider")


class TranslationResponse(BaseModel):
    """Schema for translation response."""
    original_text: str
    translated_text: str
    source_lang: str
    target_lang: str
    detected_source_lang: Optional[str] = None
    provider_used: str
    char_count: int
    word_count: int
    processing_time_ms: float
    timestamp: str


class LanguageDetectionRequest(BaseModel):
    """Schema for language detection request."""
    text: str = Field(..., min_length=1, max_length=5000, description="Text to analyze")


class LanguageDetectionResponse(BaseModel):
    """Schema for language detection response."""
    detected_lang: str
    language_name: str
    confidence: float
    is_reliable: bool


class LanguageItem(BaseModel):
    """Schema representing an individual supported language."""
    code: str
    name: str
    native_name: str
    rtl: bool = False
    flag: Optional[str] = None


class LanguagesResponse(BaseModel):
    """Schema returning the catalog of supported languages."""
    languages: List[LanguageItem]
    total: int


class HealthResponse(BaseModel):
    """Schema for health check."""
    status: str
    project: str
    version: str
    active_providers: List[str]
    default_provider: str

