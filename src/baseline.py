from pathlib import Path
import cv2
import easyocr

from src.preprocess import prepare_variants


PROJECT_ROOT = Path(__file__).resolve().parent.parent

IMAGE_PATH = (
    PROJECT_ROOT / "data" / "raw" / "rtc_samples" / "rtc_sample.jpg"
)
OUTPUT_DIR = PROJECT_ROOT / "data" / "processed" / "baseline"


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
