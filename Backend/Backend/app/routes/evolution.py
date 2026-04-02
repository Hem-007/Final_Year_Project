"""
evolution.py
------------
GET /evolution
--------------
Reads data/user_inputs.csv and returns a structured analytics payload
for the Scam Evolution Dashboard frontend page.

Returned shape:
{
    "fraud_trend":     { "YYYY-MM-DD": int, ... },   # count of fake-job predictions per day
    "scam_types":      { "Type Name": int, ... },     # keyword-based category counts
    "risk_levels":     { "Low": int, "Medium": int, "High": int },
    "common_signals":  ["keyword", ...],              # top 10 keywords across all texts
    "safety_tips":     ["tip", ...]                   # static curated list
}

Design constraints:
    - No ML — pure keyword/count logic
    - Handles empty or missing CSV gracefully (returns zeroed structure)
    - Lightweight: reads CSV once per request (file is expected to be small)
"""

import csv
import re
from collections import Counter, defaultdict
from pathlib import Path

from fastapi import APIRouter

router = APIRouter()

_ROOT_DIR = Path(__file__).resolve().parents[4]
USER_INPUTS_CSV = _ROOT_DIR / "data" / "user_inputs.csv"

# ── Scam type keyword mapping ────────────────────────────────────────────────

_SCAM_KEYWORDS: dict[str, list[str]] = {
    "Advance Fee Fraud":      ["pay fee", "registration fee", "processing fee", "send money", "wire transfer", "western union"],
    "Work From Home Scam":    ["work from home", "work at home", "remote easy", "no experience", "earn daily", "make money fast"],
    "Phishing / Data Harvest":["send passport", "national id", "bank account", "social security", "date of birth required"],
    "Unrealistic Salary":     ["high salary guaranteed", "unlimited earning", "six figure", "guaranteed income"],
    "Vague / Ghost Job":      ["no qualification", "anyone can apply", "immediate hiring", "urgent hiring", "no interview"],
}

# Keywords extracted to build the "common_signals" list
_SIGNAL_WORDS = [
    "fee", "money", "urgent", "guaranteed", "no experience", "work from home",
    "passport", "bank account", "unlimited", "immediate", "easy money",
    "wire transfer", "whatsapp", "gmail", "no interview", "anyone can apply",
    "remote", "daily earnings", "risk free", "100%", "registration",
]

_SAFETY_TIPS = [
    "Never pay a fee to get a job — legitimate employers don't charge applicants.",
    "Verify the company on its official website before sharing any personal data.",
    "Be sceptical of salary offers that seem unrealistically high for the role.",
    "Avoid job postings that ask for passport, national ID, or bank details upfront.",
    "Search the recruiter on LinkedIn and confirm they are a real employee.",
    "Use Google's reverse-image search on recruiter profile photos to check for impersonation.",
    "A corporate email (not gmail/yahoo) from the recruiter is a basic legitimacy signal.",
    "If the job description is vague and lacks clear responsibilities, treat it as a red flag.",
    "Never communicate exclusively via WhatsApp or Telegram — insist on a video interview.",
    "Report suspicious job postings to the job board and local cybercrime authorities.",
]


# ── Helpers ──────────────────────────────────────────────────────────────────

def _risk_level(prediction: int) -> str:
    """Map binary prediction label to risk bucket."""
    return "High" if prediction == 1 else "Low"


def _classify_scam_type(text: str) -> list[str]:
    lower = text.lower()
    matched = [
        stype
        for stype, keywords in _SCAM_KEYWORDS.items()
        if any(kw in lower for kw in keywords)
    ]
    return matched or ["Unclassified"]


def _extract_date(timestamp: str) -> str:
    """Return YYYY-MM-DD portion of a UTC timestamp string."""
    return timestamp[:10] if timestamp else "unknown"


def _load_csv() -> list[dict]:
    """Load user_inputs.csv rows as a list of dicts. Returns [] if file missing or empty."""
    if not USER_INPUTS_CSV.exists():
        return []
    rows = []
    try:
        with USER_INPUTS_CSV.open("r", newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                rows.append(row)
    except OSError:
        return []
    return rows


def _compute_common_signals(texts: list[str]) -> list[str]:
    """Return top-10 signal keywords ranked by occurrence across all texts."""
    counter: Counter = Counter()
    for text in texts:
        lower = text.lower()
        for kw in _SIGNAL_WORDS:
            if kw in lower:
                counter[kw] += 1
    return [kw for kw, _ in counter.most_common(10)]


# ── Route ────────────────────────────────────────────────────────────────────

@router.get("/evolution")
def get_evolution_data():
    rows = _load_csv()

    fraud_trend: dict[str, int] = defaultdict(int)
    scam_types: dict[str, int] = defaultdict(int)
    risk_levels: dict[str, int] = {"Low": 0, "Medium": 0, "High": 0}
    texts: list[str] = []

    for row in rows:
        timestamp = row.get("timestamp", "")
        raw_pred = row.get("prediction", "0")
        text = row.get("text", "")

        # Parse prediction safely
        try:
            prediction = int(raw_pred)
        except ValueError:
            prediction = 0

        date_key = _extract_date(timestamp)
        texts.append(text)

        # Fraud trend: count fake-job predictions per day
        if prediction == 1:
            fraud_trend[date_key] += 1

        # Scam type breakdown
        for stype in _classify_scam_type(text):
            scam_types[stype] += 1

        # Risk level: fake=High, real=Low (no Medium from binary model)
        level = _risk_level(prediction)
        risk_levels[level] += 1

    return {
        "fraud_trend":    dict(sorted(fraud_trend.items())),
        "scam_types":     dict(scam_types),
        "risk_levels":    risk_levels,
        "common_signals": _compute_common_signals(texts),
        "safety_tips":    _SAFETY_TIPS,
    }
