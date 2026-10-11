from rest_framework import serializers
from .models import BackupConfig, BackupRecord

class BackupConfigSerializer(serializers.ModelSerializer):
    updated_by_name = serializers.ReadOnlyField(source='updated_by.get_full_name')
    class Meta:
        model = BackupConfig
        fields = '__all__'
        read_only_fields = ['id', 'updated_at', 'updated_by', 'updated_by_name']

class BackupRecordSerializer(serializers.ModelSerializer):
    triggered_by_name = serializers.ReadOnlyField(source='triggered_by.get_full_name')
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    file_size_display = serializers.SerializerMethodField()
    duration_seconds = serializers.SerializerMethodField()
    class Meta:
        model = BackupRecord
        fields = '__all__'
    def get_file_size_display(self, obj):
        size = obj.file_size_bytes
        if size < 1024: return f"{size} B"
        if size < 1024*1024: return f"{size/1024:.1f} KB"
        return f"{size/(1024*1024):.1f} MB"
    def get_duration_seconds(self, obj):
        if obj.started_at and obj.completed_at:
            return (obj.completed_at - obj.started_at).total_seconds()
        return None
