"""Image preprocessing routines for Karnataka Land Record digitization."""

from pathlib import Path
from typing import Dict, Tuple, Union
import cv2
import numpy as np


def load_image(image_input: Union[str, Path, np.ndarray]) -> np.ndarray:
    """Load image from path or return numpy array."""
    if isinstance(image_input, np.ndarray):
        return image_input

    image_path = Path(image_input)
    if not image_path.exists():
        raise FileNotFoundError(f"Cannot read image: {image_input}")

    # Read image using OpenCV
    image = cv2.imread(str(image_path))
    if image is None:
        raise ValueError(f"OpenCV failed to decode image: {image_input}")
    return image


def crop_region(
    image: np.ndarray,
    top_ratio: float = 0.70,
    bottom_ratio: float = 0.94,
    left_ratio: float = 0.08,
    right_ratio: float = 0.92,
) -> np.ndarray:
    """Focus on specific region of interest (e.g. agreement header and party details)."""
    height, width = image.shape[:2]
    return image[
        int(height * top_ratio) : int(height * bottom_ratio),
        int(width * left_ratio) : int(width * right_ratio),
    ]


def to_grayscale(image: np.ndarray) -> np.ndarray:
    """Convert BGR image to single-channel 8-bit grayscale."""
    if len(image.shape) == 2:
        return image
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)


def upscale(
    image: np.ndarray,
    fx: float = 3.0,
    fy: float = 3.0,
    interpolation: int = cv2.INTER_CUBIC,
) -> np.ndarray:
    """Enlarge image resolution using bicubic interpolation before OCR."""
    return cv2.resize(
        image,
        None,
        fx=fx,
        fy=fy,
        interpolation=interpolation,
    )


def apply_clahe(
    gray_image: np.ndarray,
    clip_limit: float = 2.0,
    tile_grid_size: Tuple[int, int] = (8, 8),
) -> np.ndarray:
    """Enhance local contrast using Contrast Limited Adaptive Histogram Equalization."""
    if len(gray_image.shape) != 2:
        gray_image = to_grayscale(gray_image)
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
    return clahe.apply(gray_image)


def apply_otsu(
    gray_image: np.ndarray,
    blur_kernel: Tuple[int, int] = (3, 3),
) -> np.ndarray:
    """Binarize image using Gaussian blur and Otsu's optimal global threshold."""
    if len(gray_image.shape) != 2:
        gray_image = to_grayscale(gray_image)
    blurred = cv2.GaussianBlur(gray_image, blur_kernel, 0)
    _, otsu = cv2.threshold(
        blurred,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU,
    )
    return otsu


def apply_adaptive(
    gray_image: np.ndarray,
    block_size: int = 31,
    c: int = 11,
) -> np.ndarray:
    """Binarize image using adaptive Gaussian thresholding for uneven illumination."""
    if len(gray_image.shape) != 2:
        gray_image = to_grayscale(gray_image)
    return cv2.adaptiveThreshold(
        gray_image,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        block_size,
        c,
    )


def prepare_variants(
    image_input: Union[str, Path, np.ndarray],
    crop: bool = True,
) -> Dict[str, np.ndarray]:
    """Create the 4 baseline preprocessed variants (grayscale, contrast, otsu, adaptive)."""
    image = load_image(image_input)

    # Focus on the agreement heading, paragraph and party details if requested
    target = crop_region(image) if crop else image

    gray = to_grayscale(target)
    gray_enlarged = upscale(gray, fx=3.0, fy=3.0)

    # Variant 1: grayscale, enlarged
    grayscale = gray_enlarged

    # Variant 2: local contrast enhancement
    contrast = apply_clahe(gray_enlarged, clip_limit=2.0, tile_grid_size=(8, 8))

    # Variant 3: Otsu thresholding
    otsu = apply_otsu(gray_enlarged, blur_kernel=(3, 3))

    # Variant 4: adaptive thresholding
    adaptive = apply_adaptive(gray_enlarged, block_size=31, c=11)

    return {
        "grayscale": grayscale,
        "contrast": contrast,
        "otsu": otsu,
        "adaptive": adaptive,
    }

