import os
from django.http import FileResponse, Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import BackupConfig, BackupRecord
from .serializers import BackupConfigSerializer, BackupRecordSerializer
from .services import BackupService

class BackupConfigView(APIView):
    permission_classes = [IsAuthenticated] # Should be Admin/Librarian

    def get(self, request):
        service_name = request.query_params.get('service_name', 'library')
        config, _ = BackupConfig.objects.get_or_create(service_name=service_name)
        serializer = BackupConfigSerializer(config)
        return Response(serializer.data)

    def put(self, request):
        service_name = request.data.get('service_name', 'library')
        config, _ = BackupConfig.objects.get_or_create(service_name=service_name)
        serializer = BackupConfigSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(updated_by=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BackupRecordListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        service_name = request.query_params.get('service_name')
        records = BackupRecord.objects.all()
        if service_name:
            records = records.filter(service_name=service_name)
        # Add pagination in real app
        serializer = BackupRecordSerializer(records[:50], many=True)
        return Response(serializer.data)

class TriggerBackupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        service_name = request.data.get('service_name', 'library')
        include_media = request.data.get('include_media', False)
        record = BackupService.perform_backup(
            service_name=service_name,
            triggered_by=request.user,
            backup_type='MANUAL',
            include_media=include_media
        )
        serializer = BackupRecordSerializer(record)
        return Response(serializer.data)

class DownloadBackupView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        try:
            record = BackupRecord.objects.get(pk=pk)
        except BackupRecord.DoesNotExist:
            raise Http404("Backup record not found")
            
        if not record.local_path or not os.path.exists(record.local_path):
            raise Http404("Backup file not found on disk")
            
        return FileResponse(open(record.local_path, 'rb'), as_attachment=True, filename=record.file_name)

class DeleteBackupView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, pk):
        try:
            record = BackupRecord.objects.get(pk=pk)
        except BackupRecord.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
            
        if record.local_path and os.path.exists(record.local_path):
            try:
                os.remove(record.local_path)
            except OSError:
                pass
        record.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class BackupStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        library_stats = BackupService.get_backup_stats('library')
        repository_stats = BackupService.get_backup_stats('repository')
        return Response({
            'library': library_stats,
            'repository': repository_stats
        })
