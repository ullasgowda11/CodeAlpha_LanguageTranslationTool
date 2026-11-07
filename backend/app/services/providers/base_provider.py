from abc import ABC, abstractmethod
from typing import Dict, Optional, Tuple


class BaseTranslationProvider(ABC):
    """
    Abstract Base Class for Translation Service Providers.
    Follows Strategy and Provider pattern allowing seamless switching between
    Google Free, Google Cloud Translation API, MyMemory, or custom enterprise providers.
    """

    name: str = "base"

    @abstractmethod
    async def translate(
        self, text: str, source_lang: str, target_lang: str
    ) -> Tuple[str, Optional[str]]:
        """
        Translates text from source_lang to target_lang.

        Returns:
            Tuple[str, Optional[str]]: (translated_text, detected_source_language)
        """
        pass

    @abstractmethod
    async def detect_language(self, text: str) -> Tuple[str, float]:
        """
        Detects the language of the provided text.

        Returns:
            Tuple[str, float]: (language_code, confidence_score)
        """
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Checks if the provider is properly configured and reachable."""
        pass

