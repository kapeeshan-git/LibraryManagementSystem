from django.contrib import admin
from .models import Fine, PaymentReceipt

class PaymentReceiptInline(admin.TabularInline):
    model = PaymentReceipt
    extra = 0
    readonly_fields = ('receipt_number', 'amount_paid', 'payment_method', 'collected_by', 'paid_at')

@admin.register(Fine)
class FineAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'paid_amount', 'status', 'calculated_at')
    list_filter = ('status', 'calculated_at')
    search_fields = ('user__username', 'user__reg_number')
    inlines = [PaymentReceiptInline]

@admin.register(PaymentReceipt)
class PaymentReceiptAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'fine', 'amount_paid', 'payment_method', 'collected_by', 'paid_at')
    search_fields = ('receipt_number', 'fine__user__reg_number')
