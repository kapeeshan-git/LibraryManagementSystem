import re

from django. conf import settings
from django.db import transaction

from apps.audit.services import log as audit_log
from apps.core.errors import ApiError, forbidden
from apps.core.http import get_choice, get_int, get_str

from .models import Department, User

EMAIL_RE= re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

def academic_year_of(user, today):
"""Student year computed from intake year (guide 9.2); never stored."""
if user.patron_category != User.Category.STUDENT or not user. intake_year:
return None
start_year = (
today.year
if (today.month, today.day) >= tuple(settings.ACADEMIC_YEAR_START)
else today.year - 1
)
return max(1, min(settings.MAX_STUDENT_YEAR, start_year - user.intake_year + 1))

def _apply_fields(actor, user, data, creating):
changed = {}

def put(field, value):
if getattr(user, field) != value:
changed [field] = value
setattr(user, field, value)

if creating or "full_name" in data:
put("full_name", get_str(data, "full_name", required=True, max_len=200))
if creating or "email" in data:
email = get_str(data, "email", max_len=254)
if email and not EMAIL_RE.match(email):
raise ApiError(
"VALIDATION_ERROR",
"email: Enter a valid email address.",
400
{"email": "Enter a valid email address."},
)
put("email", email)
if creating or "reg_number" in data:
reg = get_str(data, "reg_number", max_len=50) or None
if reg and User.objects.filter(reg_number=reg).exclude(pk=user.pk).exists():
raise ApiError(
"VALIDATION_ERROR",
"reg_number: Already used.",
400,
{"reg_number": "Already used."},
)
put("reg_number", reg)
if creating or "patron_category" in data:
put(

"patron_category",