"""Unit tests for Phase 1 modularization: config, preprocessing, and OCR engine."""

from pathlib import Path
import numpy as np
import pytest

from src.config import load_config, config
from src.preprocess import (
    load_image,
    crop_region,
    to_grayscale,
    upscale,
    apply_clahe,
    apply_otsu,
    apply_adaptive,
    prepare_variants,
)
from src.ocr import BaseOCREngine, EasyOCREngine, get_ocr_engine

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SAMPLE_IMAGE = PROJECT_ROOT / "data" / "raw" / "rtc_samples" / "rtc_sample.jpg"


def test_config_loader():
    """Verify config loading and required schema keys."""
    cfg = load_config()
    assert "ocr" in cfg
    assert "confidence" in cfg
    assert "paths" in cfg
    assert "preprocessing" in cfg

    assert cfg["confidence"]["review_threshold"] == 0.70
    assert "en" in cfg["ocr"]["languages"]


def test_preprocessing_transforms():
    """Test image transformations on synthetic array."""
    # Synthetic 100x100 BGR image
    dummy_bgr = np.zeros((100, 100, 3), dtype=np.uint8)
    dummy_bgr[20:80, 20:80] = [200, 200, 200]

    # Grayscale
    gray = to_grayscale(dummy_bgr)
    assert len(gray.shape) == 2
    assert gray.shape == (100, 100)

    # Upscale 3x
    scaled = upscale(gray, fx=3.0, fy=3.0)
    assert scaled.shape == (300, 300)

    # CLAHE
    clahe = apply_clahe(scaled)
    assert clahe.shape == (300, 300)

    # Otsu
    otsu = apply_otsu(scaled)
    assert otsu.shape == (300, 300)
    assert set(np.unique(otsu)).issubset({0, 255})

    # Adaptive
    adaptive = apply_adaptive(scaled)
    assert adaptive.shape == (300, 300)
    assert set(np.unique(adaptive)).issubset({0, 255})


def test_prepare_variants_sample():
    """Test prepare_variants on the actual rtc_sample.jpg."""
    if not SAMPLE_IMAGE.exists():
        pytest.skip("Sample image not found")

    variants = prepare_variants(SAMPLE_IMAGE)
    assert "grayscale" in variants
    assert "contrast" in variants
    assert "otsu" in variants
    assert "adaptive" in variants

    for name, img in variants.items():
        assert isinstance(img, np.ndarray)
        assert len(img.shape) == 2
        assert img.shape[0] > 0 and img.shape[1] > 0


def test_easyocr_interface_structure():
    """Verify EasyOCREngine follows common BaseOCREngine interface."""
    engine = get_ocr_engine("easyocr", languages=["en"], gpu=False)
    assert isinstance(engine, BaseOCREngine)
    assert isinstance(engine, EasyOCREngine)

    # Test run on small synthetic image with simple text
    dummy_gray = np.ones((60, 200), dtype=np.uint8) * 255
    res = engine.run(dummy_gray)

    assert "text" in res
    assert "words" in res
    assert isinstance(res["text"], str)
    assert isinstance(res["words"], list)

    for word in res["words"]:
        assert "text" in word
        assert "bbox" in word
        assert "confidence" in word
        assert len(word["bbox"]) == 4
        # [x1, y1, x2, y2]
        assert word["bbox"][0] <= word["bbox"][2]
        assert word["bbox"][1] <= word["bbox"][3]

