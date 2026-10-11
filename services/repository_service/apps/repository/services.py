from django.utils import timezone
from apps.repository.models import ResearchPaper
import logging

logger = logging.getLogger(__name__)

class ResearchPaperService:
    @staticmethod
    def submit_paper(user, paper_data):
        return ResearchPaper.objects.create(
            **paper_data,
            lecturer_id=user.id,
            lecturer_name=user.get_full_name(),
            lecturer_reg_number=user.reg_number,
            lecturer_department=user.department,
            status=ResearchPaper.ApprovalStatus.PENDING
        )

    @staticmethod
    def review_paper(user, paper, status, review_comments):
        paper.status = status
        paper.reviewed_by_id = user.id
        paper.reviewed_by_name = user.get_full_name()
        paper.review_comments = review_comments
        paper.reviewed_at = timezone.now()
        paper.save()
        
        # We will dispatch an asynchronous event here later
        return paper
