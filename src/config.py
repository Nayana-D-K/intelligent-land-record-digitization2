"""Configuration loader for the Land Record Digitization System."""

from pathlib import Path
from typing import Any, Dict
import yaml

PROJECT_ROOT = Path(__file__).resolve().parent.parent
CONFIG_PATH = PROJECT_ROOT / "config" / "config.yaml"

DEFAULT_CONFIG: Dict[str, Any] = {
    "ocr": {
        "engine": "easyocr",
        "languages": ["en", "kn"],
        "gpu": False,
        "easyocr_params": {
            "detail": 1,
            "paragraph": False,
            "decoder": "greedy",
            "text_threshold": 0.5,
            "low_text": 0.2,
            "link_threshold": 0.4,
            "canvas_size": 2560,
            "mag_ratio": 1.0,
        },
    },
    "confidence": {
        "review_threshold": 0.70,
        "high_confidence_threshold": 0.85,
    },
    "paths": {
        "data_dir": "data",
        "raw_dir": "data/raw",
        "processed_dir": "data/processed",
        "gold_dir": "data/gold",
        "synthetic_dir": "data/synthetic",
        "baseline_output_dir": "data/processed/baseline",
    },
    "preprocessing": {
        "upscale_factor": 3.0,
        "clahe": {"clip_limit": 2.0, "tile_grid_size": [8, 8]},
        "otsu": {"blur_kernel": [3, 3]},
        "adaptive": {"block_size": 31, "c": 11},
    },
}


def load_config(config_path: Path = CONFIG_PATH) -> Dict[str, Any]:
    """Load configuration from YAML file or return defaults if file not found."""
    if not config_path.exists():
        return DEFAULT_CONFIG.copy()

    try:
        with open(config_path, "r", encoding="utf-8") as f:
            user_config = yaml.safe_load(f) or {}

        # Merge defaults with user configuration
        merged = DEFAULT_CONFIG.copy()
        for k, v in user_config.items():
            if isinstance(v, dict) and k in merged and isinstance(merged[k], dict):
                merged[k] = {**merged[k], **v}
            else:
                merged[k] = v
        return merged
    except Exception as e:
        print(f"Warning: Failed to parse {config_path}: {e}. Using default configuration.")
        return DEFAULT_CONFIG.copy()


config = load_config()

