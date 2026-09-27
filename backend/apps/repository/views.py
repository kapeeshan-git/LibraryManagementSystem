from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from django.http import FileResponse, Http404
from .models import ResearchPaper
from .serializers import ResearchPaperSerializer, ReviewPaperSerializer
from apps.authentication.models import User
from apps.notifications.models import Notification

class ResearchPaperViewSet(viewsets.ModelViewSet):
    serializer_class = ResearchPaperSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'download']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = ResearchPaper.objects.select_related('lecturer', 'reviewed_by')

        # Filter by search term
        q = self.request.query_params.get('q')
        department = self.request.query_params.get('department')
        status_param = self.request.query_params.get('status')

        if not user.is_authenticated:
            # Anonymous guests: only APPROVED and OPEN_ACCESS
            qs = qs.filter(status=ResearchPaper.ApprovalStatus.APPROVED, access_type=ResearchPaper.AccessType.OPEN_ACCESS)
        elif user.is_admin_or_librarian:
            # Staff can see all submissions and statuses
            if status_param:
                qs = qs.filter(status=status_param)
        elif user.role == User.Role.LECTURER:
            # Lecturers see all approved papers + their own submissions in any status
            qs = qs.filter(
                Q(status=ResearchPaper.ApprovalStatus.APPROVED) |
                Q(lecturer=user)
            )
        else:
            # Students: see all APPROVED papers (both Open and Campus-Only)
            qs = qs.filter(status=ResearchPaper.ApprovalStatus.APPROVED)

        if q:
            qs = qs.filter(
                Q(title__icontains=q) |
                Q(authors_display__icontains=q) |
                Q(abstract__icontains=q) |
                Q(keywords__icontains=q) |
                Q(doi__icontains=q)
            ).distinct()

        if department:
            qs = qs.filter(lecturer__department_id=department)

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != User.Role.LECTURER and not user.is_admin_or_librarian:
            raise permissions.PermissionDenied("Only academic staff (lecturers) can submit research papers to the repository.")
        serializer.save(lecturer=user, status=ResearchPaper.ApprovalStatus.PENDING)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def review(self, request, pk=None):
        """Librarian / Admin workflow to approve, request edits, or reject papers."""
        if not request.user.is_admin_or_librarian:
            return Response({'error': 'Only librarians or admins can review research papers.'}, status=status.HTTP_403_FORBIDDEN)

        paper = self.get_object()
        serializer = ReviewPaperSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        comments = serializer.validated_data.get('review_comments', '')

        paper.status = new_status
        paper.reviewed_by = request.user
        paper.review_comments = comments
        paper.reviewed_at = timezone.now()
        paper.save()

        # Send notification to author
        status_label = paper.get_status_display()
        Notification.objects.create(
            user=paper.lecturer,
            title=f"Paper Submission {status_label}",
            message=f"Your submission '{paper.title}' status is now: {status_label}. Feedback: {comments or 'None'}",
            notification_type=Notification.NotificationType.PAPER_STATUS
        )

        return Response(ResearchPaperSerializer(paper).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Increment download count and serve the PDF."""
        paper = self.get_object()

        # Access check
        if paper.access_type == ResearchPaper.AccessType.CAMPUS_ONLY and not request.user.is_authenticated:
            return Response({'error': 'This research paper is restricted to authenticated university patrons.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not paper.file:
            raise Http404("Document file not found.")

        paper.download_count += 1
        paper.save(update_fields=['download_count'])

        return FileResponse(paper.file.open(), as_attachment=True, filename=paper.file.name.split('/')[-1])
