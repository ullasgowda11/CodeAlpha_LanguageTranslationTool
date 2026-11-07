export interface LanguageItem {
  code: string;
  name: string;
  native_name: string;
  rtl: boolean;
  flag?: string;
}

export interface TranslationRequest {
  text: string;
  source_lang: string;
  target_lang: string;
  provider?: string;
}

export interface TranslationResponse {
  original_text: string;
  translated_text: string;
  source_lang: string;
  target_lang: string;
  detected_source_lang?: string;
  provider_used: string;
  char_count: number;
  word_count: number;
  processing_time_ms: number;
  timestamp: string;
}

export interface LanguageDetectionResponse {
  detected_lang: string;
  language_name: string;
  confidence: number;
  is_reliable: boolean;
}

export interface HistoryItem {
  id: string;
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  detectedSourceLang?: string;
  providerUsed: string;
  timestamp: string;
}

