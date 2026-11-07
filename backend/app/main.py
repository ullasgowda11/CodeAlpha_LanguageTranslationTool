import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.schemas import (
    HealthResponse,
    LanguageDetectionRequest,
    LanguageDetectionResponse,
    LanguagesResponse,
    TranslationRequest,
    TranslationResponse,
)
from app.services.translation_service import translation_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - [%(levelname)s] - %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    logger.info(f"Active Translation Providers: {translation_service.get_active_providers()}")
    yield
    logger.info(f"Shutting down {settings.PROJECT_NAME}")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Professional AI Language Translation API developed for CodeAlpha AI Internship",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Returns application health and active provider status."""
    return HealthResponse(
        status="healthy",
        project=settings.PROJECT_NAME,
        version=settings.VERSION,
        active_providers=translation_service.get_active_providers(),
        default_provider=settings.DEFAULT_PROVIDER,
    )


@app.get("/api/languages", response_model=LanguagesResponse, tags=["Translation"])
async def get_supported_languages():
    """Retrieves the list of 35+ supported natural languages with metadata and native names."""
    languages = translation_service.get_supported_languages()
    return LanguagesResponse(languages=languages, total=len(languages))


@app.post("/api/detect", response_model=LanguageDetectionResponse, tags=["Translation"])
async def detect_language(request: LanguageDetectionRequest):
    """Detects the natural language of input text with confidence score."""
    try:
        return await translation_service.detect_language(request.text)
    except Exception as e:
        logger.error(f"Language detection error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Language detection failed: {str(e)}",
        )


@app.post("/api/translate", response_model=TranslationResponse, tags=["Translation"])
async def translate_text(request: TranslationRequest):
    """
    Translates input text from source language to target language.
    Supports auto language detection and fallback provider orchestration.
    """
    if not request.text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Translation text cannot be empty or only whitespace.",
        )

    try:
        response = await translation_service.translate(request)
        return response
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except Exception as e:
        logger.error(f"Translation execution failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Translation provider failed: {str(e)}",
        )

