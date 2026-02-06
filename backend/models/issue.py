"""
Micro2Move - Issue & Incident Models (BCNF Normalized)
"""
from sqlalchemy import Column, String, DateTime, Date, SmallInteger, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid


class Issue(Base):
    """Reported issue with e-bike."""
    __tablename__ = "issue"
    __table_args__ = {"schema": "micro2move"}

    issue_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("micro2move.users.user_id", ondelete="RESTRICT"), nullable=False)
    e_bike_id = Column(String, ForeignKey("micro2move.e_bike.e_bike_id", ondelete="RESTRICT"), nullable=False)
    booking_id = Column(String, ForeignKey("micro2move.booking.booking_id", ondelete="SET NULL"), nullable=True)
    issue_image_link = Column(Text, nullable=True)
    issue_description = Column(Text, nullable=False)
    issue_date_time = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="issues")
    e_bike = relationship("EBike", back_populates="issues")
    booking = relationship("Booking", back_populates="issues")
    feature_checks = relationship("IssueFeatureCheck", back_populates="issue", cascade="all, delete-orphan")


class IssueFeatureCheck(Base):
    """Issue to feature check mapping (many-to-many)."""
    __tablename__ = "issue_feature_check"
    __table_args__ = {"schema": "micro2move"}

    issue_id = Column(String, ForeignKey("micro2move.issue.issue_id", ondelete="CASCADE"), primary_key=True)
    feature_check_id = Column(SmallInteger, ForeignKey("micro2move.feature_check.feature_check_id", ondelete="RESTRICT"), primary_key=True)

    # Relationships
    issue = relationship("Issue", back_populates="feature_checks")
    feature_check = relationship("FeatureCheck", back_populates="issue_checks")


class Incident(Base):
    """Incident during rental (tied to booking)."""
    __tablename__ = "incident"
    __table_args__ = {"schema": "micro2move"}

    incident_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = Column(String, ForeignKey("micro2move.booking.booking_id", ondelete="CASCADE"), nullable=False)
    incident_date = Column(Date, nullable=False, server_default=func.current_date())
    incident_image_link = Column(Text, nullable=True)
    incident_description = Column(Text, nullable=False)

    # Relationships
    booking = relationship("Booking", back_populates="incidents")
    insurance_claim = relationship("InsuranceClaim", back_populates="incident", uselist=False, cascade="all, delete-orphan")


class InsuranceClaim(Base):
    """Insurance claim (1:1 with incident)."""
    __tablename__ = "insurance_claim"
    __table_args__ = {"schema": "micro2move"}

    insurance_claim_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id = Column(String, ForeignKey("micro2move.incident.incident_id", ondelete="CASCADE"), unique=True, nullable=False)
    insurance_claim_details = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    incident = relationship("Incident", back_populates="insurance_claim")
