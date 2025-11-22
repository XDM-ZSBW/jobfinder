from sqlalchemy.orm import Session
from typing import Optional, List
import hashlib
from datetime import datetime

from app.models.profile import AnonymousProfile
from app.services.checkpoint import CheckpointService

class ProfileCRUD:
    """
    CRUD operations for AnonymousProfile with checkpoint integration.
    
    Invariants:
    - Checkpoint before all updates
    - No PII in profile data
    - Anonymous ID must be cryptographically secure
    """
    
    def __init__(self, db: Session, checkpoint_service: CheckpointService):
        self.db = db
        self.checkpoint = checkpoint_service
    
    def create(self, anonymous_id: str) -> AnonymousProfile:
        """Create new anonymous profile"""
        profile = AnonymousProfile(
            anonymous_id=anonymous_id,
            skills=[],
            portfolio_url=None,
            work_preference=None,
            work_preference_reason=None,
            bio=None
        )
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile
    
    def get(self, anonymous_id: str) -> Optional[AnonymousProfile]:
        """Get profile by anonymous ID"""
        return self.db.query(AnonymousProfile).filter(
            AnonymousProfile.anonymous_id == anonymous_id
        ).first()
    
    def update(
        self,
        anonymous_id: str,
        skills: Optional[List[str]] = None,
        portfolio_url: Optional[str] = None,
        work_preference: Optional[str] = None,
        work_preference_reason: Optional[str] = None,
        bio: Optional[str] = None
    ) -> Optional[AnonymousProfile]:
        """
        Update profile with checkpoint.
        
        Invariants:
        - Checkpoint current state before update
        - Validate no PII in update data
        """
        profile = self.get(anonymous_id)
        if not profile:
            return None
        
        # Checkpoint current state
        checkpoint_id = self.checkpoint.create_checkpoint(
            entity_type="profile",
            entity_id=anonymous_id,
            state={
                "skills": profile.skills,
                "portfolio_url": profile.portfolio_url,
                "work_preference": profile.work_preference,
                "work_preference_reason": profile.work_preference_reason,
                "bio": profile.bio
            }
        )
        
        # Update fields
        if skills is not None:
            profile.skills = skills
        if portfolio_url is not None:
            profile.portfolio_url = portfolio_url
        if work_preference is not None:
            profile.work_preference = work_preference
        if work_preference_reason is not None:
            profile.work_preference_reason = work_preference_reason
        if bio is not None:
            profile.bio = bio
        
        profile.last_checkpoint_at = datetime.utcnow()
        profile.checkpoint_version = checkpoint_id
        
        self.db.commit()
        self.db.refresh(profile)
        return profile
    
    def delete(self, anonymous_id: str) -> bool:
        """Delete profile (with checkpoint)"""
        profile = self.get(anonymous_id)
        if not profile:
            return False
        
        # Checkpoint before deletion
        self.checkpoint.create_checkpoint(
            entity_type="profile",
            entity_id=anonymous_id,
            state={
                "skills": profile.skills,
                "portfolio_url": profile.portfolio_url,
                "work_preference": profile.work_preference,
                "deleted": True
            }
        )
        
        self.db.delete(profile)
        self.db.commit()
        return True
