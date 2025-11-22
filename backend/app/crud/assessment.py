from sqlalchemy.orm import Session
from typing import Optional, List
import hashlib
from datetime import datetime

from app.models.assessment import Assessment, AssessmentStatus
from app.services.checkpoint import CheckpointService

class AssessmentCRUD:
    """
    CRUD operations for Assessment with human-in-the-loop workflow.
    
    Invariants:
    - All assessments start as SUBMITTED
    - Human review required before APPROVED
    - Checkpoint before status changes
    """
    
    def __init__(self, db: Session, checkpoint_service: CheckpointService):
        self.db = db
        self.checkpoint = checkpoint_service
    
    def create(
        self,
        anonymous_id: str,
        skills: List[str],
        portfolio_url: Optional[str],
        work_preference: str,
        work_preference_reason: Optional[str]
    ) -> Assessment:
        """Create new assessment submission"""
        assessment_id = self._generate_id(anonymous_id)
        
        assessment = Assessment(
            id=assessment_id,
            anonymous_id=anonymous_id,
            skills=skills,
            portfolio_url=portfolio_url,
            work_preference=work_preference,
            work_preference_reason=work_preference_reason,
            status=AssessmentStatus.SUBMITTED
        )
        
        self.db.add(assessment)
        self.db.commit()
        self.db.refresh(assessment)
        return assessment
    
    def get(self, assessment_id: str) -> Optional[Assessment]:
        """Get assessment by ID"""
        return self.db.query(Assessment).filter(
            Assessment.id == assessment_id
        ).first()
    
    def get_by_anonymous_id(self, anonymous_id: str) -> List[Assessment]:
        """Get all assessments for anonymous user"""
        return self.db.query(Assessment).filter(
            Assessment.anonymous_id == anonymous_id
        ).order_by(Assessment.submitted_at.desc()).all()
    
    def get_pending_review(self) -> List[Assessment]:
        """Get assessments pending human review"""
        return self.db.query(Assessment).filter(
            Assessment.status.in_([
                AssessmentStatus.SUBMITTED,
                AssessmentStatus.PENDING_REVIEW
            ])
        ).order_by(Assessment.submitted_at.asc()).all()
    
    def update_status(
        self,
        assessment_id: str,
        new_status: AssessmentStatus,
        reviewer_id: Optional[str] = None,
        review_notes: Optional[str] = None
    ) -> Optional[Assessment]:
        """
        Update assessment status with checkpoint.
        
        Invariants:
        - Checkpoint before status change
        - Record reviewer ID (human-in-the-loop)
        """
        assessment = self.get(assessment_id)
        if not assessment:
            return None
        
        # Checkpoint current state
        checkpoint_id = self.checkpoint.create_checkpoint(
            entity_type="assessment",
            entity_id=assessment_id,
            state={
                "status": assessment.status.value,
                "reviewed_by": assessment.reviewed_by,
                "review_notes": assessment.review_notes
            }
        )
        
        assessment.status = new_status
        assessment.checkpoint_before_review = checkpoint_id
        
        if reviewer_id:
            assessment.reviewed_by = reviewer_id
        if review_notes:
            assessment.review_notes = review_notes
        if new_status in [AssessmentStatus.APPROVED, AssessmentStatus.REJECTED]:
            assessment.reviewed_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(assessment)
        return assessment
    
    def add_ai_analysis(
        self,
        assessment_id: str,
        ai_analysis: dict,
        ai_confidence: str
    ) -> Optional[Assessment]:
        """
        Add AI analysis to assessment (queued for human review).
        
        Invariants:
        - AI analysis does not auto-approve
        - Human review still required
        """
        assessment = self.get(assessment_id)
        if not assessment:
            return None
        
        assessment.ai_analysis = ai_analysis
        assessment.ai_confidence = ai_confidence
        assessment.status = AssessmentStatus.PENDING_REVIEW
        
        self.db.commit()
        self.db.refresh(assessment)
        return assessment
    
    def _generate_id(self, anonymous_id: str) -> str:
        """Generate unique assessment ID"""
        timestamp = datetime.utcnow().isoformat()
        data = f"assessment:{anonymous_id}:{timestamp}"
        return hashlib.sha256(data.encode()).hexdigest()[:32]
