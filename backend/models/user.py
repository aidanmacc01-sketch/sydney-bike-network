"""
Micro2Move - User & Authorization Models (BCNF Normalized)
"""
from sqlalchemy import Column, String, Boolean, DateTime, Date, SmallInteger, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid


class Authorization(Base):
    """Authorization roles master table."""
    __tablename__ = "authorization"
    __table_args__ = {"schema": "micro2move"}

    authorization_id = Column(SmallInteger, primary_key=True, autoincrement=True)
    authorization_role = Column(Text, unique=True, nullable=False)

    # Relationships
    user_authorizations = relationship("UserAuthorization", back_populates="authorization")


class User(Base):
    """Main user account."""
    __tablename__ = "users"
    __table_args__ = {"schema": "micro2move"}

    user_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String(150), nullable=False)
    hashed_password = Column(Text, nullable=False)
    date_of_birth = Column(Date, nullable=True)
    email = Column(Text, unique=True, nullable=False, index=True)
    tnc_accepted = Column(Boolean, default=False, nullable=False)
    profile_image_link = Column(Text, nullable=True)
    govt_id_image_link = Column(Text, nullable=True)
    joining_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    authorizations = relationship("UserAuthorization", back_populates="user", cascade="all, delete-orphan")
    supplier = relationship("Supplier", back_populates="user", uselist=False, cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="renter", foreign_keys="Booking.renter_user_id")
    ratings = relationship("EBikeRating", back_populates="renter")
    issues = relationship("Issue", back_populates="user")


class UserAuthorization(Base):
    """User to Authorization mapping (many-to-many)."""
    __tablename__ = "user_authorization"
    __table_args__ = {"schema": "micro2move"}

    user_id = Column(String, ForeignKey("micro2move.users.user_id", ondelete="CASCADE"), primary_key=True)
    authorization_id = Column(SmallInteger, ForeignKey("micro2move.authorization.authorization_id", ondelete="RESTRICT"), primary_key=True)
    granted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="authorizations")
    authorization = relationship("Authorization", back_populates="user_authorizations")


class Supplier(Base):
    """Supplier extension to user (1:1)."""
    __tablename__ = "supplier"
    __table_args__ = {"schema": "micro2move"}

    supplier_user_id = Column(String, ForeignKey("micro2move.users.user_id", ondelete="CASCADE"), primary_key=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    verified_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="supplier")
    e_bikes = relationship("EBike", back_populates="supplier")
