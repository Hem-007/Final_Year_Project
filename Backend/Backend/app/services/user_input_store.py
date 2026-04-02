"""
user_input_store.py
-------------------
Handles storage of user inputs for future model retraining.
Stores job text, prediction label, and timestamp to data/user_inputs.csv.

Usage:
    from app.services.user_input_store import store_user_input
    store_user_input(text="some job text", prediction=1)

Constraints:
    - Appends to CSV (does not overwrite)
    - Safe for concurrent usage (single-write operations are atomic at OS level)
    - Creates file and parent directory automatically if missing
    - Does NOT alter prediction logic in any way
"""

import csv
import logging
from datetime import datetime, timezone
from pathlib import Path

logger = logging.getLogger(__name__)

# Resolves to: <repo_root>/data/user_inputs.csv
_ROOT_DIR = Path(__file__).resolve().parents[4]
USER_INPUTS_CSV = _ROOT_DIR / "data" / "user_inputs.csv"

_CSV_HEADERS = ["timestamp", "prediction", "text"]


def _ensure_file() -> None:
    """Create the CSV file with headers if it does not already exist."""
    USER_INPUTS_CSV.parent.mkdir(parents=True, exist_ok=True)
    if not USER_INPUTS_CSV.exists():
        with USER_INPUTS_CSV.open("w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(_CSV_HEADERS)
        logger.info("[user_input_store] Created %s with headers.", USER_INPUTS_CSV)


def store_user_input(text: str, prediction: int) -> None:
    """
    Append one row to data/user_inputs.csv.

    Parameters
    ----------
    text : str
        The raw job posting text submitted by the user.
    prediction : int
        Model prediction — 1 for Fake Job, 0 for Real Job.
    """
    _ensure_file()
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

    try:
        with USER_INPUTS_CSV.open("a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([timestamp, int(prediction), text.replace("\n", " ").strip()])
        logger.debug("[user_input_store] Stored input — prediction=%d, chars=%d", prediction, len(text))
    except OSError as exc:
        # Log but never crash the prediction pipeline
        logger.error("[user_input_store] Failed to write row: %s", exc)
