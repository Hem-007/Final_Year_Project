import html
import re
from collections.abc import Iterable

MAX_SEQUENCE_LENGTH = 256


def merge_text_fields(*texts) -> str:
    merged_parts = []

    for item in texts:
        if item is None:
            continue
        if isinstance(item, str):
            if item.strip():
                merged_parts.append(item.strip())
            continue
        if isinstance(item, Iterable):
            for nested_item in item:
                if nested_item is not None and str(nested_item).strip():
                    merged_parts.append(str(nested_item).strip())
            continue
        if str(item).strip():
            merged_parts.append(str(item).strip())

    return " ".join(merged_parts)


def clean_text(text: str | None) -> str:
    if text is None:
        return ""

    if not isinstance(text, str):
        text = str(text)

    text = html.unescape(text.lower())
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    text = re.sub(r"\S+@\S+", " ", text)
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    return text


def prepare_for_model(text: str, tokenizer, max_len: int = MAX_SEQUENCE_LENGTH):
    if tokenizer is None:
        raise ValueError("Tokenizer is not available.")

    cleaned_text = clean_text(text)
    if not cleaned_text:
        raise ValueError("No valid text was available after preprocessing.")

    from tensorflow.keras.preprocessing.sequence import pad_sequences

    sequences = tokenizer.texts_to_sequences([cleaned_text])
    padded_sequences = pad_sequences(
        sequences,
        maxlen=max_len,
        padding="post",
        truncating="post",
    )

    return cleaned_text, padded_sequences
