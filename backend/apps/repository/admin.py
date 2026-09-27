from django.contrib import admin
from .models import ResearchPaper

@admin.register(ResearchPaper)
class ResearchPaperAdmin(admin.ModelAdmin):
    list_display = ('title', 'lecturer', 'access_type', 'status', 'submitted_at', 'download_count')
    list_filter = ('status', 'access_type', 'submitted_at')
    search_fields = ('title', 'authors_display', 'lecturer__username', 'lecturer__reg_number', 'keywords')
