import pickle
import re
from functools import lru_cache
from pathlib import Path

import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, regularizers
from tensorflow.keras.models import load_model

from app.services.preprocess_service import MAX_SEQUENCE_LENGTH, prepare_for_model

ROOT_DIR = Path(__file__).resolve().parents[4]
MODEL_PATH = ROOT_DIR / "models" / "joint_model_final.keras"
TOKENIZER_PATH = ROOT_DIR / "data" / "processed" / "tokenizer.pkl"
PREDICTION_THRESHOLD = 0.5


class MaxoutLayer(layers.Layer):
    def __init__(self, units: int, num_pieces: int = 2, l2: float = 1e-4, **kwargs):
        super().__init__(**kwargs)
        self.units = units
        self.num_pieces = num_pieces
        self.l2_val = l2

    def build(self, input_shape):
        input_dim = int(input_shape[-1])
        reg = regularizers.l2(self.l2_val)
        self.W = self.add_weight(
            name="W", shape=(input_dim, self.units * self.num_pieces),
            initializer="glorot_uniform", regularizer=reg, trainable=True,
        )
        self.b = self.add_weight(
            name="b", shape=(self.units * self.num_pieces,),
            initializer="zeros", trainable=True,
        )
        super().build(input_shape)

    def call(self, inputs):
        z = tf.matmul(inputs, self.W) + self.b
        z = tf.reshape(z, (-1, self.units, self.num_pieces))
        return tf.reduce_max(z, axis=-1)

    def get_config(self):
        config = super().get_config()
        config.update({"units": self.units, "num_pieces": self.num_pieces, "l2": self.l2_val})
        return config


# ─── Rule-based XAI helpers ───────────────────────────────────────────────────

SCAM_PATTERNS = {
    "Advance Fee Fraud": [r"pay.*fee", r"registration fee", r"processing fee", r"send money", r"wire transfer", r"western union"],
    "Work From Home Scam": [r"work from home", r"work at home", r"remote.*easy", r"no experience", r"earn.*daily", r"\$\d+.*per.*day", r"make money fast"],
    "Phishing / Data Harvest": [r"send.*passport", r"national id", r"bank account", r"social security", r"date of birth.*required"],
    "Unrealistic Salary": [r"\$\d{4,}.*week", r"\$\d{3,}.*hour", r"high salary guaranteed", r"unlimited earning", r"six.?figure"],
    "Vague / Ghost Job": [r"no qualification", r"anyone can apply", r"immediate hiring", r"100 positions", r"urgent hiring", r"no interview"],
}

RISK_FACTOR_CHECKS = [
    ("Suspicious payment request", 0.35, [r"pay.*fee", r"registration.*fee", r"send money", r"wire transfer"]),
    ("Unrealistic salary promise", 0.30, [r"\$\d{4,}.*week", r"\$\d{3,}.*hour", r"unlimited earning", r"six.?figure"]),
    ("Requests for personal data", 0.25, [r"passport", r"national id", r"bank account", r"social security"]),
    ("No experience / urgent hiring", 0.20, [r"no experience", r"urgent hiring", r"immediate start", r"anyone can apply"]),
    ("Vague job description", 0.15, [r"flexible hours", r"easy money", r"work from home", r"no qualification"]),
    ("Unprofessional language", 0.10, [r"!!!", r"\$\$\$", r"100%", r"guaranteed job", r"no risk"]),
    ("Missing company name", 0.10, []),
    ("Non-corporate contact channel", 0.10, [r"gmail\.com", r"yahoo\.com", r"hotmail\.com", r"whatsapp"]),
]

POSITIVE_CHECKS = [
    ("Company name clearly mentioned", [r"inc\b", r"ltd\b", r"llc\b", r"corp\b", r"company", r"organization"]),
    ("Structured job requirements listed", [r"requirements:", r"qualifications:", r"skills:", r"responsibilities:"]),
    ("Professional contact provided", [r"hr@", r"careers@", r"recruit", r"\.com/careers"]),
    ("Clear compensation range", [r"\$\d+.*-.*\$\d+", r"salary range", r"competitive.*package"]),
    ("Standard application process", [r"apply online", r"submit.*resume", r"cover letter", r"interview process"]),
    ("Benefits package mentioned", [r"health.*insurance", r"401k", r"paid.*leave", r"vacation", r"benefits package"]),
]

IMPORTANT_FIELDS = [
    ("Company name", [r"inc\b", r"ltd\b", r"llc\b", r"corp\b", r"company", r"organization", r"employer"]),
    ("Salary / compensation", [r"salary", r"compensation", r"\$\d+", r"pay range", r"ctc"]),
    ("Contact information", [r"contact", r"email", r"phone", r"apply.*at", r"hr@"]),
    ("Job location", [r"location", r"remote", r"on.?site", r"hybrid", r"city", r"state"]),
    ("Required qualifications", [r"qualifications", r"requirements", r"degree", r"experience.*year"]),
]


def _lower(text):
    return text.lower()

def _matches_any(text, patterns):
    t = _lower(text)
    return any(re.search(p, t) for p in patterns)

def _compute_risk_factors(text, fraud_prob):
    factors = []
    for label, weight, patterns in RISK_FACTOR_CHECKS:
        if label == "Missing company name":
            if not _matches_any(text, [r"inc\b", r"ltd\b", r"llc\b", r"corp\b", r"company"]):
                factors.append({"factor": label, "weight": weight})
        elif patterns and _matches_any(text, patterns):
            factors.append({"factor": label, "weight": weight})
    factors.append({"factor": "BiLSTM model risk signal", "weight": round(min(fraud_prob, 0.95), 2)})
    factors.sort(key=lambda x: x["weight"], reverse=True)
    return factors[:5]

def _compute_positive_indicators(text, fraud_prob):
    indicators = []
    for label, patterns in POSITIVE_CHECKS:
        if _matches_any(text, patterns):
            indicators.append(label)
    if fraud_prob < 0.4:
        indicators.append("Low overall fraud probability from model")
    if len(text.split()) > 150:
        indicators.append("Detailed job description provided")
    return indicators[:5]

def _detect_scam_types(text):
    detected = [st for st, patterns in SCAM_PATTERNS.items() if _matches_any(text, patterns)]
    return detected if detected else ["None detected"]

def _detect_missing_fields(text):
    return [field for field, patterns in IMPORTANT_FIELDS if not _matches_any(text, patterns)]

def _model_contribution(fraud_prob):
    text_weight = min(0.55 + abs(fraud_prob - 0.5) * 0.2, 0.80)
    meta_weight = 1.0 - text_weight
    return {"text": round(text_weight * 100, 1), "metadata": round(meta_weight * 100, 1)}

def _risk_breakdown(fraud_prob, text):
    rule_hits = sum(1 for _, _, p in RISK_FACTOR_CHECKS if p and _matches_any(text, p))
    metadata_risk = float(min(rule_hits * 8, 60))
    text_risk = round(fraud_prob * 100, 1)
    total_risk = round(text_risk * 0.65 + metadata_risk * 0.35, 1)
    return {"text_risk": text_risk, "metadata_risk": metadata_risk, "total_risk": total_risk}

def _final_verdict(prediction, risk_level, fraud_prob, scam_types, missing_fields):
    pct = round(fraud_prob * 100, 1)
    scam_str = ", ".join(s for s in scam_types if s != "None detected")
    if prediction == "Fake Job":
        base = f"Our AI model flagged this posting as likely fraudulent with a {pct}% risk score."
        if scam_str:
            base += f" Detected scam patterns include: {scam_str}."
        base += " Do NOT share personal information or pay any fees." if risk_level == "High" else " Verify the employer through official channels before proceeding."
    else:
        base = f"This posting appears legitimate with a {pct}% fraud probability — below the detection threshold."
        if missing_fields:
            base += f" However, the following details are absent: {', '.join(missing_fields)}."
        base += " Always verify the employer on official websites before sharing personal details."
    return base


# ─── Main pipeline ─────────────────────────────────────────────────────────────

class PredictionPipeline:
    def __init__(self):
        self.max_sequence_length = MAX_SEQUENCE_LENGTH
        self.tokenizer = self._load_tokenizer()
        self.model = self._load_model()

    def _load_tokenizer(self):
        if not TOKENIZER_PATH.exists():
            raise FileNotFoundError(f"Tokenizer not found at {TOKENIZER_PATH}")
        with TOKENIZER_PATH.open("rb") as f:
            return pickle.load(f)

    def _load_model(self):
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
        model = load_model(MODEL_PATH, custom_objects={"MaxoutLayer": MaxoutLayer}, compile=False)
        model.make_predict_function()
        return model

    def _calculate_risk_level(self, p):
        return "High" if p > 0.75 else ("Medium" if p >= 0.5 else "Low")

    def _calculate_confidence(self, p):
        c = abs(p - PREDICTION_THRESHOLD) * 2
        return "High" if c >= 0.6 else ("Medium" if c >= 0.3 else "Low")

    def _calculate_confidence_pct(self, p):
        return round(abs(p - PREDICTION_THRESHOLD) * 200, 1)

    def _build_recommendation(self, prediction, risk_level):
        if prediction == "Fake Job":
            if risk_level == "High":
                return "This job post shows strong scam indicators. Avoid sharing personal or financial information until the employer is independently verified."
            return "This job post shows some scam-related characteristics. Verify the company, recruiter identity, and contact channels before continuing."
        if risk_level == "Low":
            return "This job post appears legitimate based on the current model output, but you should still verify the employer and application process."
        return "This job post leans legitimate, but some caution is still advised. Confirm the employer, job details, and communication channels before proceeding."

    def predict_text(self, user_text: str, input_source: str = "text") -> dict:
        cleaned_text, padded_sequences = prepare_for_model(user_text, self.tokenizer, max_len=self.max_sequence_length)
        probabilities = self.model.predict(padded_sequences, verbose=0)
        fraud_probability = float(np.asarray(probabilities).reshape(-1)[0])
        prediction = "Fake Job" if fraud_probability >= PREDICTION_THRESHOLD else "Real Job"
        risk_level = self._calculate_risk_level(fraud_probability)

        scam_types = _detect_scam_types(user_text)
        missing_fields = _detect_missing_fields(user_text)

        return {
            # ── original fields (preserved) ──
            "prediction": prediction,
            "fraud_probability": round(fraud_probability, 4),
            "confidence": self._calculate_confidence(fraud_probability),
            "risk_level": risk_level,
            "input_source": input_source,
            "cleaned_text_length": len(cleaned_text),
            "recommendation": self._build_recommendation(prediction, risk_level),
            # ── new XAI fields ──
            "confidence_pct": self._calculate_confidence_pct(fraud_probability),
            "risk_factors": _compute_risk_factors(user_text, fraud_probability),
            "positive_indicators": _compute_positive_indicators(user_text, fraud_probability),
            "model_contribution": _model_contribution(fraud_probability),
            "scam_type": scam_types,
            "missing_fields": missing_fields,
            "risk_breakdown": _risk_breakdown(fraud_probability, user_text),
            "final_verdict": _final_verdict(prediction, risk_level, fraud_probability, scam_types, missing_fields),
        }


@lru_cache(maxsize=1)
def get_prediction_pipeline() -> PredictionPipeline:
    return PredictionPipeline()


def predict_text(user_text: str, input_source: str = "text") -> dict:
    return get_prediction_pipeline().predict_text(user_text, input_source=input_source)
