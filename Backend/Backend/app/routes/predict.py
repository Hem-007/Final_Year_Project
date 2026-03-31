import sys
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from app.services import prediction_service

BACKEND_DIR = Path(__file__).resolve().parents[3]
if str(BACKEND_DIR) not in sys.path:
    sys.path.append(str(BACKEND_DIR))

from OCR.utils.ocr_reader import extract_text_from_image
from websc_proj.scraper import extract_text_from_url

router = APIRouter()
UPLOAD_DIR = BACKEND_DIR / "OCR" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


class AnalyzeRequest(BaseModel):
    text: str | None = None
    url: str | None = None
    input_type: str | None = None
    input_data: str | None = None


def _validate_text_input(input_data: str | None) -> str:
    text = (input_data or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text input cannot be empty.")
    return text


def _build_response(prediction_result: dict, extracted_text: str) -> dict:
    """Build the full API response including all XAI fields."""
    return {
        # ── legacy / original fields (preserved for backward compat) ──
        "label": prediction_result["prediction"],
        "probability": prediction_result["fraud_probability"],
        "confidence": prediction_result["confidence"],
        "prediction": prediction_result["prediction"],
        "fraud_probability": prediction_result["fraud_probability"],
        "risk_level": prediction_result["risk_level"],
        "input_source": prediction_result["input_source"],
        "extracted_text_length": len(extracted_text),
        "recommendation": prediction_result["recommendation"],
        # ── new XAI fields ──
        "confidence_pct": prediction_result.get("confidence_pct", 0),
        "risk_factors": prediction_result.get("risk_factors", []),
        "positive_indicators": prediction_result.get("positive_indicators", []),
        "model_contribution": prediction_result.get("model_contribution", {"text": 65, "metadata": 35}),
        "scam_type": prediction_result.get("scam_type", ["None detected"]),
        "missing_fields": prediction_result.get("missing_fields", []),
        "risk_breakdown": prediction_result.get("risk_breakdown", {}),
        "final_verdict": prediction_result.get("final_verdict", prediction_result.get("recommendation", "")),
    }


# JSON endpoint (text / url)
@router.post("/analyze")
async def analyze_job(payload: AnalyzeRequest):
    if payload.text is not None:
        input_type = "text"
        input_data = payload.text
    elif payload.url is not None:
        input_type = "url"
        input_data = payload.url
    elif payload.input_type is not None:
        input_type = payload.input_type.lower().strip()
        input_data = payload.input_data
    else:
        raise HTTPException(
            status_code=400,
            detail="Provide 'text' or 'url' to analyze. For images use POST /analyze/image.",
        )

    if input_type not in {"text", "url"}:
        raise HTTPException(
            status_code=400,
            detail="input_type must be 'text' or 'url'. For images use POST /analyze/image.",
        )

    try:
        if input_type == "text":
            extracted_text = _validate_text_input(input_data)
        else:
            url_value = _validate_text_input(input_data)
            extracted_text = extract_text_from_url(url_value)

        print(f"[Backend] input_type={input_type}, text_length={len(extracted_text)}")
        result = prediction_service.predict_text(extracted_text, input_source=input_type)
        return _build_response(result, extracted_text)

    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction pipeline failed: {str(exc)}") from exc


# Multipart endpoint (image)
@router.post("/analyze/image")
async def analyze_job_image(image: UploadFile = File(...)):
    saved_image_path: Path | None = None
    try:
        suffix = Path(image.filename or "upload").suffix or ".png"
        saved_image_path = UPLOAD_DIR / f"{uuid4().hex}{suffix}"
        saved_image_path.write_bytes(await image.read())

        extracted_text = extract_text_from_image(saved_image_path)
        print(f"[Backend] image OCR, text_length={len(extracted_text)}")
        result = prediction_service.predict_text(extracted_text, input_source="image")
        return _build_response(result, extracted_text)

    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(exc)}") from exc
    finally:
        if saved_image_path and saved_image_path.exists():
            saved_image_path.unlink(missing_ok=True)


# Legacy /predict
@router.post("/predict")
def predict_job(input: AnalyzeRequest):
    raw_text = input.text or input.input_data
    result = prediction_service.predict_text(_validate_text_input(raw_text))
    return {
        "label": result["prediction"],
        "probability": result["fraud_probability"],
        "confidence": result["confidence"],
        "prediction": result["prediction"],
        "fraud_probability": result["fraud_probability"],
        "risk_level": result["risk_level"],
        "input_source": result["input_source"],
        "extracted_text_length": result["cleaned_text_length"],
        "recommendation": result["recommendation"],
    }
