import requests
import sys
from pathlib import Path
from urllib.parse import urlparse

from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

APP_ROOT = Path(__file__).resolve().parents[1] / "Backend"
if str(APP_ROOT) not in sys.path:
    sys.path.append(str(APP_ROOT))

from app.services.preprocess_service import clean_text, merge_text_fields

def get_session_with_retries(retries=3):
    session = requests.Session()
    retry_strategy = Retry(
        total=retries,
        backoff_factor=0.5,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=frozenset(["GET"]),
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session


def _normalize_url(url: str) -> str:
    candidate = (url or "").strip()
    if not candidate:
        raise ValueError("URL input cannot be empty.")

    parsed = urlparse(candidate)
    if not parsed.scheme:
        candidate = f"https://{candidate}"
        parsed = urlparse(candidate)

    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError("Invalid URL. Please provide a valid http or https link.")

    return candidate


def extract_text_from_url(url: str) -> str:
    normalized_url = _normalize_url(url)
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Connection": "keep-alive",
    }

    session = get_session_with_retries(retries=3)

    try:
        response = session.get(normalized_url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()

        title = soup.title.get_text(" ", strip=True) if soup.title else ""
        visible_text = " ".join(soup.stripped_strings)
        extracted_text = clean_text(merge_text_fields(title, visible_text))

        if not extracted_text:
            raise ValueError("No readable text could be extracted from the provided URL.")

        return extracted_text

    except requests.exceptions.Timeout:
        raise ValueError("The request timed out while trying to fetch the job posting URL.")
    except requests.exceptions.RequestException as exc:
        raise ValueError(f"Unable to fetch the provided URL: {exc}") from exc
    finally:
        session.close()


def scrape_url(url, delay=0):
    try:
        normalized_url = _normalize_url(url)
        text = extract_text_from_url(normalized_url)
        return {
            "url": normalized_url,
            "title": "Success",
            "text": text,
        }
    except Exception as exc:
        return {
            "url": url,
            "title": "Error",
            "text": str(exc),
        }
