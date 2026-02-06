"""
Community Models - Groups, Rides, Comments, Reports
"""
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey, JSON, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class MemberRole(enum.Enum):
    MEMBER = "member"
    MODERATOR = "moderator"
    ADMIN = "admin"


class RSVPStatus(enum.Enum):
    GOING = "going"
    MAYBE = "maybe"
    NOT_GOING = "not_going"


class ReportStatus(enum.Enum):
    PENDING = "pending"
    REVIEWED = "reviewed"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


class Community(Base):
    """Cycling community groups."""
    __tablename__ = "communities"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)  # URL-friendly name
    description = Column(Text, nullable=True)

    # Location
    region = Column(String, nullable=True)  # e.g., "Western Sydney", "Eastern Suburbs"
    home_location = Column(JSON, nullable=True)  # {lat, lng}
    coverage_area = Column(JSON, default=list)  # Polygon of coverage

    # Media
    logo_url = Column(String, nullable=True)
    banner_url = Column(String, nullable=True)
    color = Column(String, default="#7C3AED")  # Brand color

    # Links
    website = Column(String, nullable=True)
    facebook = Column(String, nullable=True)
    instagram = Column(String, nullable=True)
    strava_club = Column(String, nullable=True)

    # Stats
    member_count = Column(Integer, default=0)
    ride_count = Column(Integer, default=0)
    total_km = Column(Float, default=0.0)

    # Settings
    is_public = Column(Boolean, default=True)
    requires_approval = Column(Boolean, default=False)
    is_official = Column(Boolean, default=False)  # Official partner
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    members = relationship("CommunityMember", back_populates="community", cascade="all, delete-orphan")
    rides = relationship("CommunityRide", back_populates="community", cascade="all, delete-orphan")


class CommunityMember(Base):
    """Membership in communities."""
    __tablename__ = "community_members"

    id = Column(String, primary_key=True)
    community_id = Column(String, ForeignKey("communities.id", ondelete="CASCADE"))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))

    role = Column(SQLEnum(MemberRole), default=MemberRole.MEMBER)
    is_approved = Column(Boolean, default=True)

    # Stats within community
    rides_attended = Column(Integer, default=0)
    km_contributed = Column(Float, default=0.0)

    # Timestamps
    joined_at = Column(DateTime, server_default=func.now())

    # Relationships
    community = relationship("Community", back_populates="members")
    user = relationship("User", back_populates="community_memberships")


class CommunityRide(Base):
    """Scheduled community rides."""
    __tablename__ = "community_rides"

    id = Column(String, primary_key=True)
    community_id = Column(String, ForeignKey("communities.id", ondelete="CASCADE"))
    organizer_id = Column(String, ForeignKey("users.id"))

    # Ride details
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    ride_type = Column(String, default="social")  # social, training, commute, tour

    # Time
    start_datetime = Column(DateTime, nullable=False)
    estimated_duration_minutes = Column(Integer, default=120)

    # Location
    meeting_point = Column(JSON, nullable=False)  # {lat, lng, address, notes}
    end_point = Column(JSON, nullable=True)
    route_id = Column(String, ForeignKey("routes.id"), nullable=True)

    # Ride info
    distance_km = Column(Float, nullable=True)
    difficulty = Column(String, default="easy")  # easy, moderate, hard
    pace = Column(String, default="social")  # social, moderate, fast

    # Capacity
    max_participants = Column(Integer, nullable=True)
    current_participants = Column(Integer, default=0)

    # Requirements
    helmet_required = Column(Boolean, default=True)
    lights_required = Column(Boolean, default=False)
    ebike_friendly = Column(Boolean, default=True)
    beginner_friendly = Column(Boolean, default=True)

    # Rewards
    points_reward = Column(Integer, default=50)

    # Status
    status = Column(String, default="scheduled")  # scheduled, in_progress, completed, cancelled
    is_recurring = Column(Boolean, default=False)
    recurrence_rule = Column(String, nullable=True)  # iCal RRULE format

    # Media
    photo_url = Column(String, nullable=True)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    community = relationship("Community", back_populates="rides")
    rsvps = relationship("RideRSVP", back_populates="ride", cascade="all, delete-orphan")


class RideRSVP(Base):
    """RSVPs for community rides."""
    __tablename__ = "ride_rsvps"

    id = Column(String, primary_key=True)
    ride_id = Column(String, ForeignKey("community_rides.id", ondelete="CASCADE"))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))

    status = Column(SQLEnum(RSVPStatus), default=RSVPStatus.GOING)
    attended = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    ride = relationship("CommunityRide", back_populates="rsvps")
    user = relationship("User", back_populates="ride_rsvps")


class Comment(Base):
    """Comments on rides, routes, stores, etc."""
    __tablename__ = "comments"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))

    # Target
    target_type = Column(String, nullable=False)  # ride, route, store, report
    target_id = Column(String, nullable=False)

    # Content
    content = Column(Text, nullable=False)
    parent_id = Column(String, nullable=True)  # For replies

    # Reactions
    likes_count = Column(Integer, default=0)

    # Status
    is_visible = Column(Boolean, default=True)
    is_edited = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="comments")


class Report(Base):
    """User reports for hazards, issues, etc."""
    __tablename__ = "reports"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))

    # Report type
    report_type = Column(String, nullable=False)  # hazard, pothole, debris, lighting, theft, other

    # Location
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String, nullable=True)

    # Details
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(String, default="medium")  # low, medium, high, critical

    # Media
    photos = Column(JSON, default=list)

    # Status
    status = Column(SQLEnum(ReportStatus), default=ReportStatus.PENDING)
    resolution_notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)

    # Verification
    upvotes = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)

    # Points
    points_awarded = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="reports")
