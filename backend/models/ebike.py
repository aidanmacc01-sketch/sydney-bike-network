"""
Micro2Move - E-Bike Models (BCNF Normalized)
"""
from sqlalchemy import Column, String, Boolean, DateTime, Date, SmallInteger, Numeric, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid


class EBikeStatus(Base):
    """E-bike status master table."""
    __tablename__ = "e_bike_status"


    e_bike_status_id = Column(SmallInteger, primary_key=True, autoincrement=True)
    e_bike_status_name = Column(Text, unique=True, nullable=False)

    # Relationships
    e_bikes = relationship("EBike", back_populates="status")


class EBikeCategory(Base):
    """E-bike category master table."""
    __tablename__ = "e_bike_category"


    e_bike_category_id = Column(SmallInteger, primary_key=True, autoincrement=True)
    e_bike_category_name = Column(Text, unique=True, nullable=False)

    # Relationships
    e_bikes = relationship("EBike", back_populates="category")


class FeatureCheck(Base):
    """Feature check master table."""
    __tablename__ = "feature_check"


    feature_check_id = Column(SmallInteger, primary_key=True, autoincrement=True)
    feature_check_name = Column(Text, unique=True, nullable=False)

    # Relationships
    e_bike_checks = relationship("EBikeFeatureCheck", back_populates="feature_check")
    issue_checks = relationship("IssueFeatureCheck", back_populates="feature_check")


class EBike(Base):
    """E-bike listing."""
    __tablename__ = "e_bike"


    e_bike_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    e_bike_name = Column(String(120), nullable=False)
    supplier_user_id = Column(String, ForeignKey("supplier.supplier_user_id", ondelete="RESTRICT"), nullable=False)
    price_per_week = Column(Numeric(10, 2), nullable=False)
    available_from_date = Column(Date, nullable=False)
    available_to_date = Column(Date, nullable=True)
    e_bike_category_id = Column(SmallInteger, ForeignKey("e_bike_category.e_bike_category_id", ondelete="RESTRICT"), nullable=False)
    pick_up_geo_location_id = Column(String, ForeignKey("geo_location.geo_location_id", ondelete="SET NULL"), nullable=True)
    e_bike_status_id = Column(SmallInteger, ForeignKey("e_bike_status.e_bike_status_id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    supplier = relationship("Supplier", back_populates="e_bikes")
    category = relationship("EBikeCategory", back_populates="e_bikes")
    status = relationship("EBikeStatus", back_populates="e_bikes")
    pick_up_location = relationship("GeoLocation", foreign_keys=[pick_up_geo_location_id])
    feature_checks = relationship("EBikeFeatureCheck", back_populates="e_bike", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="e_bike")
    ratings = relationship("EBikeRating", back_populates="e_bike", cascade="all, delete-orphan")
    issues = relationship("Issue", back_populates="e_bike")


class EBikeFeatureCheck(Base):
    """E-bike feature check results."""
    __tablename__ = "e_bike_feature_check"


    e_bike_id = Column(String, ForeignKey("e_bike.e_bike_id", ondelete="CASCADE"), primary_key=True)
    feature_check_id = Column(SmallInteger, ForeignKey("feature_check.feature_check_id", ondelete="RESTRICT"), primary_key=True)
    checked_ok = Column(Boolean, default=False, nullable=False)
    checked_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    e_bike = relationship("EBike", back_populates="feature_checks")
    feature_check = relationship("FeatureCheck", back_populates="e_bike_checks")


class EBikeRating(Base):
    """E-bike rating by renter."""
    __tablename__ = "e_bike_rating"


    e_bike_rating_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    renter_user_id = Column(String, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False)
    e_bike_id = Column(String, ForeignKey("e_bike.e_bike_id", ondelete="CASCADE"), nullable=False)
    e_bike_rating = Column(SmallInteger, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
    rating_date_time = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    renter = relationship("User", back_populates="ratings")
    e_bike = relationship("EBike", back_populates="ratings")
