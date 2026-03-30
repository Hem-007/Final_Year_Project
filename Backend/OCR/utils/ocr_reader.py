import sys
from functools import lru_cache
from pathlib import Path

import easyocr

APP_ROOT = Path(__file__).resolve().parents[2] / "Backend"
if str(APP_ROOT) not in sys.path:
    sys.path.append(str(APP_ROOT))

from app.services.preprocess_service import clean_text

SUPPORTED_IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".bmp", ".gif", ".tiff", ".webp"}


@lru_cache(maxsize=1)
def get_reader():
    return easyocr.Reader(["en"], gpu=False)


def extract_text_from_image(image_path) -> str:
    path = Path(image_path)

    if not path.exists():
        raise FileNotFoundError("Uploaded image could not be found for OCR processing.")

    if path.suffix.lower() not in SUPPORTED_IMAGE_SUFFIXES:
        raise ValueError("Unsupported image format. Please upload a PNG, JPG, JPEG, BMP, GIF, TIFF, or WEBP file.")

    try:
        results = get_reader().readtext(str(path), detail=0, paragraph=True)
    except Exception as exc:
        raise ValueError("Failed to extract text from the uploaded image.") from exc

    extracted_text = clean_text(" ".join(text.strip() for text in results if str(text).strip()))
    if not extracted_text:
        raise ValueError("No readable text was detected in the uploaded image.")

    return extracted_text


def extract_text(image_path):
    return extract_text_from_image(image_path)