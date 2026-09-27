from rest_framework import serializers
from .models import ResearchPaper

class ResearchPaperSerializer(serializers.ModelSerializer):
    lecturer_name = serializers.ReadOnlyField(source='lecturer.get_full_name')
    lecturer_reg_number = serializers.ReadOnlyField(source='lecturer.reg_number')
    lecturer_department = serializers.ReadOnlyField(source='lecturer.department.name')
    reviewed_by_name = serializers.ReadOnlyField(source='reviewed_by.get_full_name')
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    access_type_display = serializers.CharField(source='get_access_type_display', read_only=True)

    class Meta:
        model = ResearchPaper
        fields = [
            'id', 'lecturer', 'lecturer_name', 'lecturer_reg_number', 'lecturer_department',
            'title', 'authors_display', 'abstract', 'keywords', 'doi',
            'journal_or_conference', 'publication_date', 'file', 'access_type',
            'access_type_display', 'status', 'status_display', 'reviewed_by',
            'reviewed_by_name', 'review_comments', 'download_count',
            'submitted_at', 'reviewed_at'
        ]
        read_only_fields = ['id', 'lecturer', 'status', 'reviewed_by', 'review_comments', 'download_count', 'submitted_at', 'reviewed_at']


class ReviewPaperSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[
        ResearchPaper.ApprovalStatus.APPROVED,
        ResearchPaper.ApprovalStatus.EDITS_REQUESTED,
        ResearchPaper.ApprovalStatus.REJECTED
    ])
    review_comments = serializers.CharField(required=False, allow_blank=True)
