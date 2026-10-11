"""
REST client for inter-service communication with the Catalog & E-Books Microservice.
Used by Library Functions service to check/update book copy status, increment stats, etc.
"""
import requests
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def _get_base_url():
    return getattr(settings, 'CATALOG_SERVICE_URL', 'http://127.0.0.1:8001')


def _get_headers():
    return {
        'X-Internal-API-Key': getattr(settings, 'INTERNAL_API_KEY', 'dev-internal-api-key-catalog'),
        'Content-Type': 'application/json',
    }


def get_copy_by_accession(accession_number):
    """Get book copy details by accession/barcode number."""
    try:
        url = f"{_get_base_url()}/internal/copies/{accession_number}/"
        resp = requests.get(url, headers=_get_headers(), timeout=5)
        if resp.status_code == 200:
            return resp.json()
        return None
    except Exception as e:
        logger.error(f"Catalog service error (get_copy): {e}")
        return None


def update_copy_status(copy_id, new_status, condition=None):
    """Update a book copy's status (AVAILABLE, BORROWED, ON_HOLD, etc.)."""
    try:
        url = f"{_get_base_url()}/internal/copies/{copy_id}/status/"
        data = {'status': new_status}
        if condition:
            data['condition'] = condition
        resp = requests.patch(url, json=data, headers=_get_headers(), timeout=5)
        return resp.status_code == 200
    except Exception as e:
        logger.error(f"Catalog service error (update_copy_status): {e}")
        return False


def increment_book_stat(book_id, field):
    """Increment borrow_count, hold_count, or search_count on a book."""
    try:
        url = f"{_get_base_url()}/internal/books/{book_id}/increment-stat/"
        resp = requests.post(url, json={'field': field}, headers=_get_headers(), timeout=5)
        return resp.status_code == 200
    except Exception as e:
        logger.error(f"Catalog service error (increment_stat): {e}")
        return False


def get_book_details(book_id):
    """Get book details by ID."""
    try:
        url = f"{_get_base_url()}/internal/books/{book_id}/"
        resp = requests.get(url, headers=_get_headers(), timeout=5)
        if resp.status_code == 200:
            return resp.json()
        return None
    except Exception as e:
        logger.error(f"Catalog service error (get_book): {e}")
        return None


def get_copy_availability(book_id):
    """Check copy availability for a book (find first available copy)."""
    try:
        url = f"{_get_base_url()}/internal/books/{book_id}/availability/"
        resp = requests.get(url, headers=_get_headers(), timeout=5)
        if resp.status_code == 200:
            return resp.json()
        return None
    except Exception as e:
        logger.error(f"Catalog service error (availability): {e}")
        return None
