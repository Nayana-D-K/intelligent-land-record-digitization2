
from pathlib import Path

import cv2
import easyocr


PROJECT_ROOT = Path(__file__).resolve().parent.parent

IMAGE_PATH = (
    PROJECT_ROOT / "data" / "raw" / "rtc_samples" / "rtc_sample.jpg"
)
OUTPUT_DIR = PROJECT_ROOT / "data" / "processed" / "baseline"


def prepare_variants(image_path):
    """Create alternative versions of the agreement text crop."""

    image = cv2.imread(str(image_path))

    if image is None:
        raise FileNotFoundError(f"Cannot read image: {image_path}")

    height, width = image.shape[:2]

    # Focus on the agreement heading, paragraph and party details.
    crop = image[
        int(height * 0.70):int(height * 0.94),
        int(width * 0.08):int(width * 0.92),
    ]

    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)

    # Enlarge text before preprocessing.
    gray = cv2.resize(
        gray,
        None,
        fx=3,
        fy=3,
        interpolation=cv2.INTER_CUBIC,
    )

    # Variant 1: grayscale, enlarged
    grayscale = gray

    # Variant 2: local contrast enhancement
    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8),
    )
    contrast = clahe.apply(gray)

    # Variant 3: Otsu thresholding
    blurred = cv2.GaussianBlur(gray, (3, 3), 0)
    _, otsu = cv2.threshold(
        blurred,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU,
    )

    # Variant 4: adaptive thresholding
    adaptive = cv2.adaptiveThreshold(
        gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        11,
    )

    return {
        "grayscale": grayscale,
        "contrast": contrast,
        "otsu": otsu,
        "adaptive": adaptive,
    }


def run_ocr(reader, image, name):
    """Recognize text and save it with confidence scores."""

    results = reader.readtext(
        image,
        detail=1,
        paragraph=False,
        decoder="greedy",
        text_threshold=0.5,
        low_text=0.2,
        link_threshold=0.4,
        canvas_size=2560,
        mag_ratio=1.0,
    )

    output_path = OUTPUT_DIR / f"agreement_{name}.txt"

    lines = [
        f"{index}. {text} [confidence: {confidence:.2f}]"
        for index, (_, text, confidence) in enumerate(results, start=1)
    ]

    output_path.write_text("\n".join(lines), encoding="utf-8")

    print(f"\n--- {name.upper()} ---")
    for _, text, confidence in results:
        print(f"{text} [confidence: {confidence:.2f}]")

    print(f"Saved: {output_path.name}")


def main():
    if not IMAGE_PATH.exists():
        raise FileNotFoundError(f"Image not found: {IMAGE_PATH}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    variants = prepare_variants(IMAGE_PATH)

    for name, image in variants.items():
        cv2.imwrite(
            str(OUTPUT_DIR / f"agreement_{name}.png"),
            image,
        )

    print("Loading EasyOCR...")
    reader = easyocr.Reader(["en"], gpu=False)

    for name, image in variants.items():
        run_ocr(reader, image, name)

    print("\nAll four preprocessing tests completed.")
    print(f"Results folder: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
