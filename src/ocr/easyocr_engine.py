"""EasyOCR engine implementation conforming to the common OCR interface."""

from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import cv2
import easyocr
import numpy as np

from src.ocr.base import BaseOCREngine
from src.preprocess.pipeline import load_image


class EasyOCREngine(BaseOCREngine):
    """EasyOCR wrapper providing standardized text extraction and word-level bboxes."""

    def __init__(
        self,
        languages: Optional[List[str]] = None,
        gpu: bool = False,
        detail: int = 1,
        paragraph: bool = False,
        decoder: str = "greedy",
        text_threshold: float = 0.5,
        low_text: float = 0.2,
        link_threshold: float = 0.4,
        canvas_size: int = 2560,
        mag_ratio: float = 1.0,
    ):
        self.languages = languages or ["en"]
        self.gpu = gpu
        self.detail = detail
        self.paragraph = paragraph
        self.decoder = decoder
        self.text_threshold = text_threshold
        self.low_text = low_text
        self.link_threshold = link_threshold
        self.canvas_size = canvas_size
        self.mag_ratio = mag_ratio

        self._reader: Optional[easyocr.Reader] = None

    @property
    def reader(self) -> easyocr.Reader:
        """Lazily initialize easyocr Reader to avoid heavy startup overhead."""
        if self._reader is None:
            self._reader = easyocr.Reader(self.languages, gpu=self.gpu)
        return self._reader

    def run(self, image: Union[str, Path, np.ndarray]) -> Dict[str, Any]:
        """
        Execute EasyOCR on input image.

        Returns:
            Dict containing:
              - 'text': string containing all recognized text lines joined by newline.
              - 'words': list of dicts with 'text', 'bbox' [x1, y1, x2, y2], and 'confidence'.
        """
        img_array = load_image(image)

        raw_results = self.reader.readtext(
            img_array,
            detail=self.detail,
            paragraph=self.paragraph,
            decoder=self.decoder,
            text_threshold=self.text_threshold,
            low_text=self.low_text,
            link_threshold=self.link_threshold,
            canvas_size=self.canvas_size,
            mag_ratio=self.mag_ratio,
        )

        words_list: List[Dict[str, Any]] = []
        text_lines: List[str] = []

        for item in raw_results:
            # item format: (bbox_polygon, text, confidence)
            if len(item) >= 3:
                poly, word_text, confidence = item[0], str(item[1]), float(item[2])
            elif len(item) == 2:
                poly, word_text = item[0], str(item[1])
                confidence = 1.0
            else:
                continue

            # Convert 4-point polygon [[x1, y1], [x2, y1], [x2, y2], [x1, y2]] to [x1, y1, x2, y2]
            try:
                x_coords = [float(pt[0]) for pt in poly]
                y_coords = [float(pt[1]) for pt in poly]
                bbox = [
                    int(round(min(x_coords))),
                    int(round(min(y_coords))),
                    int(round(max(x_coords))),
                    int(round(max(y_coords))),
                ]
            except Exception:
                bbox = [0, 0, 0, 0]

            cleaned_text = word_text.strip()
            if cleaned_text:
                text_lines.append(cleaned_text)
                words_list.append({
                    "text": cleaned_text,
                    "bbox": bbox,
                    "confidence": round(confidence, 4),
                    "polygon": poly if isinstance(poly, list) else [],
                })

        return {
            "text": "\n".join(text_lines),
            "words": words_list,
        }

