"""
Micro2Move - Booking Models (BCNF Normalized)
"""
from sqlalchemy import Column, String, DateTime, Date, SmallInteger, Numeric, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid


class BookingStatus(Base):
    """Booking status master table."""
    __tablename__ = "booking_status"
    __table_args__ = {"schema": "micro2move"}

    booking_status_id = Column(SmallInteger, primary_key=True, autoincrement=True)
    booking_status_name = Column(Text, unique=True, nullable=False)

    # Relationships
    bookings = relationship("Booking", back_populates="status")


class Booking(Base):
    """E-bike booking/rental."""
    __tablename__ = "booking"
    __table_args__ = {"schema": "micro2move"}

    booking_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    e_bike_id = Column(String, ForeignKey("micro2move.e_bike.e_bike_id", ondelete="RESTRICT"), nullable=False)
    renter_user_id = Column(String, ForeignKey("micro2move.users.user_id", ondelete="RESTRICT"), nullable=False)
    booking_status_id = Column(SmallInteger, ForeignKey("micro2move.booking_status.booking_status_id", ondelete="RESTRICT"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    booking_date_time = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    agreed_price_per_week = Column(Numeric(10, 2), nullable=False)
    total_amount = Column(Numeric(12, 2), nullable=False)
    pick_up_geo_location_id = Column(String, ForeignKey("micro2move.geo_location.geo_location_id", ondelete="SET NULL"), nullable=True)
    return_geo_location_id = Column(String, ForeignKey("micro2move.geo_location.geo_location_id", ondelete="SET NULL"), nullable=True)

    # Relationships
    e_bike = relationship("EBike", back_populates="bookings")
    renter = relationship("User", back_populates="bookings")
    status = relationship("BookingStatus", back_populates="bookings")
    pick_up_location = relationship("GeoLocation", foreign_keys=[pick_up_geo_location_id])
    return_location = relationship("GeoLocation", foreign_keys=[return_geo_location_id])
    handover = relationship("Handover", back_populates="booking", uselist=False, cascade="all, delete-orphan")
    bike_return = relationship("BikeReturn", back_populates="booking", uselist=False, cascade="all, delete-orphan")
    incidents = relationship("Incident", back_populates="booking", cascade="all, delete-orphan")
    issues = relationship("Issue", back_populates="booking")
    accounts = relationship("Accounts", back_populates="booking", cascade="all, delete-orphan")
    cancellation = relationship("BookingCancellation", back_populates="booking", uselist=False, cascade="all, delete-orphan")


class Handover(Base):
    """Bike handover record (1:1 with booking)."""
    __tablename__ = "handover"
    __table_args__ = {"schema": "micro2move"}

    handover_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = Column(String, ForeignKey("micro2move.booking.booking_id", ondelete="CASCADE"), unique=True, nullable=False)
    handover_date_time = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    handover_location_id = Column(String, ForeignKey("micro2move.geo_location.geo_location_id", ondelete="SET NULL"), nullable=True)
    pre_handover_image_link = Column(Text, nullable=True)

    # Relationships
    booking = relationship("Booking", back_populates="handover")
    location = relationship("GeoLocation", foreign_keys=[handover_location_id])


class BikeReturn(Base):
    """Bike return record (1:1 with booking)."""
    __tablename__ = "bike_return"
    __table_args__ = {"schema": "micro2move"}

    return_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = Column(String, ForeignKey("micro2move.booking.booking_id", ondelete="CASCADE"), unique=True, nullable=False)
    return_date_time = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    return_location_id = Column(String, ForeignKey("micro2move.geo_location.geo_location_id", ondelete="SET NULL"), nullable=True)
    return_image_link = Column(Text, nullable=True)

    # Relationships
    booking = relationship("Booking", back_populates="bike_return")
    location = relationship("GeoLocation", foreign_keys=[return_location_id])


class BookingCancellation(Base):
    """Booking cancellation record (0/1 per booking)."""
    __tablename__ = "booking_cancellation"
    __table_args__ = {"schema": "micro2move"}

    booking_cancellation_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = Column(String, ForeignKey("micro2move.booking.booking_id", ondelete="CASCADE"), unique=True, nullable=False)
    cancellation_date = Column(Date, nullable=False, server_default=func.current_date())
    cancellation_charge = Column(Numeric(12, 2), nullable=False, default=0)

    # Relationships
    booking = relationship("Booking", back_populates="cancellation")
