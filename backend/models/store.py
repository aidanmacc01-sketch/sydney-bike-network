"""
Store Models - E-bike Stores, Reviews, Demo Bookings
"""
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class EbikeStore(Base):
    """E-bike stores with demo rentals."""
    __tablename__ = "ebike_stores"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    # Location
    address = Column(String, nullable=False)
    suburb = Column(String, nullable=True)
    postcode = Column(String, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    # Contact
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    website = Column(String, nullable=True)

    # Hours
    opening_hours = Column(JSON, default=dict)  # {"mon": "9-5", "tue": "9-5", ...}

    # Features
    has_demo_bikes = Column(Boolean, default=True)
    has_repairs = Column(Boolean, default=False)
    has_accessories = Column(Boolean, default=False)
    is_partner = Column(Boolean, default=False)  # Partner for rewards

    # Demo bikes available
    demo_bikes = Column(JSON, default=list)  # [{brand, model, type, price_per_hour}, ...]

    # Discount for app users
    app_discount_percentage = Column(Integer, default=0)

    # Media
    logo_url = Column(String, nullable=True)
    photos = Column(JSON, default=list)

    # Rating
    avg_rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)

    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    reviews = relationship("StoreReview", back_populates="store", cascade="all, delete-orphan")
    bookings = relationship("DemoBooking", back_populates="store", cascade="all, delete-orphan")


class StoreReview(Base):
    """User reviews for stores."""
    __tablename__ = "store_reviews"

    id = Column(String, primary_key=True)
    store_id = Column(String, ForeignKey("ebike_stores.id", ondelete="CASCADE"))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))

    # Review
    rating = Column(Integer, nullable=False)  # 1-5
    title = Column(String, nullable=True)
    content = Column(Text, nullable=True)

    # Helpful
    helpful_count = Column(Integer, default=0)

    # Status
    is_verified_purchase = Column(Boolean, default=False)
    is_visible = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    store = relationship("EbikeStore", back_populates="reviews")
    user = relationship("User", back_populates="store_reviews")


class DemoBooking(Base):
    """Demo bike booking/rental."""
    __tablename__ = "demo_bookings"

    id = Column(String, primary_key=True)
    store_id = Column(String, ForeignKey("ebike_stores.id", ondelete="CASCADE"))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))

    # Booking details
    bike_type = Column(String, nullable=False)  # Which demo bike
    bike_model = Column(String, nullable=True)

    # Time
    booking_date = Column(DateTime, nullable=False)
    start_time = Column(String, nullable=False)  # "10:00"
    duration_hours = Column(Integer, default=1)

    # Price
    total_price = Column(Float, default=0.0)
    discount_applied = Column(Float, default=0.0)
    discount_code = Column(String, nullable=True)

    # Status
    status = Column(String, default="pending")  # pending, confirmed, completed, cancelled
    confirmation_code = Column(String, nullable=True)

    # Notes
    special_requests = Column(Text, nullable=True)
    store_notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    store = relationship("EbikeStore", back_populates="bookings")
    user = relationship("User", back_populates="demo_bookings")
