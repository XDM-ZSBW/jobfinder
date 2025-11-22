"""Initial schema with anonymous profiles, assessments, and matches

Revision ID: 001
Revises: 
Create Date: 2025-01-01 00:00:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create anonymous_profiles table
    op.create_table(
        'anonymous_profiles',
        sa.Column('anonymous_id', sa.String(64), primary_key=True),
        sa.Column('skills', postgresql.JSON, nullable=False, server_default='[]'),
        sa.Column('portfolio_url', sa.String(512), nullable=True),
        sa.Column('work_preference', sa.String(256), nullable=True),
        sa.Column('work_preference_reason', sa.String(2048), nullable=True),
        sa.Column('bio', sa.String(2048), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.Column('last_checkpoint_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('checkpoint_version', sa.String(32), nullable=True),
    )
    op.create_index('ix_anonymous_profiles_anonymous_id', 'anonymous_profiles', ['anonymous_id'])

    # Create assessments table
    op.create_table(
        'assessments',
        sa.Column('id', sa.String(64), primary_key=True),
        sa.Column('anonymous_id', sa.String(64), nullable=False),
        sa.Column('skills', postgresql.JSON, nullable=False),
        sa.Column('portfolio_url', sa.String(512), nullable=True),
        sa.Column('work_preference', sa.String(256), nullable=False),
        sa.Column('work_preference_reason', sa.String(2048), nullable=True),
        sa.Column('status', sa.String(32), nullable=False, server_default='submitted'),
        sa.Column('reviewed_by', sa.String(64), nullable=True),
        sa.Column('review_notes', sa.String(4096), nullable=True),
        sa.Column('ai_analysis', postgresql.JSON, nullable=True),
        sa.Column('ai_confidence', sa.String(16), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('checkpoint_before_review', sa.String(64), nullable=True),
    )
    op.create_index('ix_assessments_id', 'assessments', ['id'])
    op.create_index('ix_assessments_anonymous_id', 'assessments', ['anonymous_id'])
    op.create_index('ix_assessments_status', 'assessments', ['status'])

    # Create matches table
    op.create_table(
        'matches',
        sa.Column('id', sa.String(64), primary_key=True),
        sa.Column('anonymous_id', sa.String(64), nullable=False),
        sa.Column('job_id', sa.String(64), nullable=False),
        sa.Column('match_score', sa.Integer, nullable=False),
        sa.Column('matching_capabilities', postgresql.JSON, nullable=False),
        sa.Column('required_capabilities', postgresql.JSON, nullable=False),
        sa.Column('title', sa.String(256), nullable=False),
        sa.Column('company', sa.String(256), nullable=False),
        sa.Column('location', sa.String(256), nullable=False),
        sa.Column('description', sa.String(4096), nullable=False),
        sa.Column('is_remote', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('is_approved', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('approved_by', sa.String(64), nullable=True),
        sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('ai_rationale', sa.String(4096), nullable=True),
        sa.Column('ai_confidence', sa.String(16), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index('ix_matches_id', 'matches', ['id'])
    op.create_index('ix_matches_anonymous_id', 'matches', ['anonymous_id'])
    op.create_index('ix_matches_job_id', 'matches', ['job_id'])
    op.create_index('ix_matches_is_approved', 'matches', ['is_approved'])


def downgrade() -> None:
    op.drop_table('matches')
    op.drop_table('assessments')
    op.drop_table('anonymous_profiles')
