"""Common interface and base class for OCR engines."""

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any, Dict, List, Union
import numpy as np


class BaseOCREngine(ABC):
    """Abstract base class establishing standard contract for OCR engines."""

    @abstractmethod
    def run(self, image: Union[str, Path, np.ndarray]) -> Dict[str, Any]:
        """
        Run OCR on given image input.

        Args:
            image: Path to image file or numpy ndarray (BGR or Grayscale).

        Returns:
            Dictionary matching common schema:
            {
                "text": "Full extracted text content",
                "words": [
                    {
                        "text": "word or line segment",
                        "bbox": [x1, y1, x2, y2],
                        "confidence": float (0.0 to 1.0),
                        "polygon": [[x1, y1], [x2, y1], [x2, y2], [x1, y2]] (optional)
                    },
                    ...
                ]
            }
        """
        pass

