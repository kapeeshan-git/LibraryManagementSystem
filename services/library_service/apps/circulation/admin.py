from django.contrib import admin
from .models import BorrowRecord, CirculationRule

admin.site.register(BorrowRecord)
admin.site.register(CirculationRule)
