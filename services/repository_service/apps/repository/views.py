from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import FileResponse, Http404
from .models import ResearchPaper
from .serializers import ResearchPaperSerializer, ReviewPaperSerializer
from .services import ResearchPaperService

def is_staff_or_admin(user):
    return user.is_authenticated and (user.is_staff or getattr(user, 'is_superuser', False))

class ResearchPaperViewSet(viewsets.ModelViewSet):
    queryset = ResearchPaper.objects.all().order_by('-submitted_at')
    serializer_class = ResearchPaperSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'abstract', 'lecturer_name', 'tags']

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'download']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def check_permissions(self, request):
        super().check_permissions(request)
        if self.action in ['update', 'partial_update', 'destroy']:
            if not is_staff_or_admin(request.user):
                self.permission_denied(request, message="Library Staff or Admin role required.")

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action == 'list' and not is_staff_or_admin(self.request.user):
            qs = qs.filter(status=ResearchPaper.ApprovalStatus.APPROVED)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if getattr(user, 'role', '') not in ('LECTURER', 'ADMIN', 'LIBRARIAN') and not user.is_staff:
            raise permissions.PermissionDenied("Only academic staff can submit research papers.")
        ResearchPaperService.submit_paper(user, serializer.validated_data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def review(self, request, pk=None):
        if not is_staff_or_admin(request.user):
            return Response({'error': 'Only librarians or admins can review papers.'}, status=status.HTTP_403_FORBIDDEN)
        
        paper = self.get_object()
        serializer = ReviewPaperSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        updated_paper = ResearchPaperService.review_paper(
            user=request.user,
            paper=paper,
            status=serializer.validated_data['status'],
            review_comments=serializer.validated_data.get('review_comments', '')
        )
        return Response(ResearchPaperSerializer(updated_paper).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        paper = self.get_object()
        if paper.access_type == ResearchPaper.AccessType.CAMPUS_ONLY and not getattr(request.user, 'id', None):
            return Response({'error': 'Restricted to authenticated university patrons.'}, status=status.HTTP_401_UNAUTHORIZED)
        if not paper.file:
            raise Http404("Document file not found.")
        paper.download_count += 1
        paper.save(update_fields=['download_count'])
        return FileResponse(paper.file.open(), as_attachment=True, filename=paper.file.name.split('/')[-1])
