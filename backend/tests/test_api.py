import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_api_health_endpoint():
    """Verify health endpoint returns healthy status and providers."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "google_free" in data["active_providers"]


@pytest.mark.asyncio
async def test_api_languages_endpoint():
    """Verify languages catalog endpoint returns list of languages."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/languages")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] > 30
        assert len(data["languages"]) == data["total"]


@pytest.mark.asyncio
async def test_api_detect_endpoint():
    """Verify language detection endpoint."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {"text": "Guten Morgen, wie geht es Ihnen?"}
        response = await client.post("/api/detect", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["detected_lang"] == "de"


@pytest.mark.asyncio
async def test_api_translate_endpoint():
    """Verify translate endpoint returns valid translation response."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "text": "Artificial Intelligence is transforming modern technology.",
            "source_lang": "en",
            "target_lang": "fr"
        }
        response = await client.post("/api/translate", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "intelligence artificielle" in data["translated_text"].lower()
        assert data["source_lang"] == "en"
        assert data["target_lang"] == "fr"


@pytest.mark.asyncio
async def test_api_translate_empty_text_validation():
    """Verify validation error when text is empty."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "text": "",
            "source_lang": "en",
            "target_lang": "fr"
        }
        response = await client.post("/api/translate", json=payload)
        assert response.status_code == 422

