from sqlalchemy.orm import Session
from typing import Optional, List
import hashlib
from datetime import datetime

from app.models.match import Match

class MatchCRUD:
    """
    CRUD operations for Match with approval workflow.
    
    Invariants:
    - Only approved matches shown to users
    - Human approval required for all matches
    - Match score based on capabilities, not credentials
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(
        self,
        anonymous_id: str,
        job_id: str,
        match_score: int,
        matching_capabilities: List[str],
        required_capabilities: List[str],
        title: str,
        company: str,
        location: str,
        description: str,
        is_remote: bool,
        ai_rationale: Optional[str] = None,
        ai_confidence: Optional[str] = None
    ) -> Match:
        """Create new match (pending approval)"""
        match_id = self._generate_id(anonymous_id, job_id)
        
        match = Match(
            id=match_id,
            anonymous_id=anonymous_id,
            job_id=job_id,
            match_score=match_score,
            matching_capabilities=matching_capabilities,
            required_capabilities=required_capabilities,
            title=title,
            company=company,
            location=location,
            description=description,
            is_remote=is_remote,
            is_approved=False,  # Always starts unapproved
            ai_rationale=ai_rationale,
            ai_confidence=ai_confidence
        )
        
        self.db.add(match)
        self.db.commit()
        self.db.refresh(match)
        return match
    
    def get(self, match_id: str) -> Optional[Match]:
        """Get match by ID"""
        return self.db.query(Match).filter(Match.id == match_id).first()
    
    def get_approved_for_user(
        self,
        anonymous_id: str,
        remote_only: bool = False,
        min_score: int = 0
    ) -> List[Match]:
        """
        Get approved matches for user with filters.
        
        Invariants:
        - Only return approved matches
        - Filter by user preferences
        """
        query = self.db.query(Match).filter(
            Match.anonymous_id == anonymous_id,
            Match.is_approved == True,
            Match.match_score >= min_score
        )
        
        if remote_only:
            query = query.filter(Match.is_remote == True)
        
        return query.order_by(Match.match_score.desc()).all()
    
    def get_pending_approval(self) -> List[Match]:
        """Get matches pending human approval"""
        return self.db.query(Match).filter(
            Match.is_approved == False
        ).order_by(Match.created_at.asc()).all()
    
    def approve(
        self,
        match_id: str,
        approver_id: str
    ) -> Optional[Match]:
        """
        Approve match (human-in-the-loop).
        
        Invariants:
        - Requires human approver ID
        - Records approval timestamp
        """
        match = self.get(match_id)
        if not match:
            return None
        
        match.is_approved = True
        match.approved_by = approver_id
        match.approved_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(match)
        return match
    
    def reject(self, match_id: str) -> bool:
        """Reject/delete match"""
        match = self.get(match_id)
        if not match:
            return False
        
        self.db.delete(match)
        self.db.commit()
        return True
    
    def _generate_id(self, anonymous_id: str, job_id: str) -> str:
        """Generate unique match ID"""
        timestamp = datetime.utcnow().isoformat()
        data = f"match:{anonymous_id}:{job_id}:{timestamp}"
        return hashlib.sha256(data.encode()).hexdigest()[:32]
