import type {
  LanguageDetectionResponse,
  LanguageItem,
  TranslationRequest,
  TranslationResponse,
} from '../types/translation';

const API_BASE = '/api';

export async function fetchLanguages(): Promise<LanguageItem[]> {
  const res = await fetch(`${API_BASE}/languages`);
  if (!res.ok) {
    throw new Error(`Failed to load languages (HTTP ${res.status})`);
  }
  const data = await res.json();
  return data.languages || [];
}

export async function translateText(
  payload: TranslationRequest
): Promise<TranslationResponse> {
  const res = await fetch(`${API_BASE}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorMsg = `Translation request failed (HTTP ${res.status})`;
    try {
      const err = await res.json();
      if (err.detail) errorMsg = err.detail;
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export async function detectLanguage(text: string): Promise<LanguageDetectionResponse> {
  const res = await fetch(`${API_BASE}/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error('Language detection failed');
  }

  return res.json();
}

export async function checkBackendHealth(): Promise<{ status: string; providers: string[] }> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (res.ok) {
      const data = await res.json();
      return { status: 'healthy', providers: data.active_providers || [] };
    }
    return { status: 'degraded', providers: [] };
  } catch {
    return { status: 'offline', providers: [] };
  }
}
