"""OCR engine subpackage providing standardized character recognition interfaces."""

from typing import Any, Optional
from src.ocr.base import BaseOCREngine
from src.ocr.easyocr_engine import EasyOCREngine


def get_ocr_engine(engine_name: str = "easyocr", **kwargs: Any) -> BaseOCREngine:
    """Factory helper to obtain an OCR engine by identifier."""
    name = engine_name.lower()
    if name == "easyocr":
        return EasyOCREngine(**kwargs)
    raise ValueError(f"Unsupported OCR engine: {engine_name}")


__all__ = [
    "BaseOCREngine",
    "EasyOCREngine",
    "get_ocr_engine",
]

