from django.contrib import admin
from .models import Reservation

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('user', 'book', 'allocated_copy', 'queue_position', 'status', 'reserved_at', 'hold_expires_at')
    list_filter = ('status', 'reserved_at')
    search_fields = ('user__username', 'user__reg_number', 'book__title', 'allocated_copy__accession_number')
