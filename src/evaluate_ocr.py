
from pathlib import Path
from jiwer import cer, wer

ROOT = Path(__file__).resolve().parent.parent

GROUND_TRUTH = ROOT / "data" / "gold" / "sale_deed_ground_truth.txt"
RAW_OCR = ROOT / "data" / "processed" / "baseline" / "raw_ocr.txt"
PROCESSED_OCR = (
    ROOT / "data" / "processed" / "baseline" / "preprocessed_ocr.txt"
)


def read_text(path: Path) -> str:
    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")
    return path.read_text(encoding="utf-8").strip()


def main():
    reference = read_text(GROUND_TRUTH)
    raw = read_text(RAW_OCR)
    processed = read_text(PROCESSED_OCR)

    if not reference:
        raise ValueError("Ground-truth file is empty.")

    print("\nOCR Evaluation")
    print("-" * 40)

    print(f"Raw CER:          {cer(reference, raw):.4f}")
    print(f"Raw WER:          {wer(reference, raw):.4f}")

    print(f"Processed CER:    {cer(reference, processed):.4f}")
    print(f"Processed WER:    {wer(reference, processed):.4f}")

    print("\nLower scores are better.")
    print("CER = Character Error Rate")
    print("WER = Word Error Rate")


if __name__ == "__main__":
    main()
