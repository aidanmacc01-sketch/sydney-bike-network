"""
Route Models - Routes, Favorites, History
"""
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Route(Base):
    """Saved or planned routes."""
    __tablename__ = "routes"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    # Route data
    start_location = Column(JSON)  # {lat, lng, address}
    end_location = Column(JSON)  # {lat, lng, address}
    waypoints = Column(JSON, default=list)  # [{lat, lng, address}, ...]
    polyline = Column(Text, nullable=True)  # Encoded polyline

    # Metrics
    distance_km = Column(Float, default=0.0)
    duration_minutes = Column(Integer, default=0)
    elevation_gain = Column(Float, default=0.0)

    # Attributes
    has_shade = Column(Boolean, default=False)
    is_scenic = Column(Boolean, default=False)
    is_safe = Column(Boolean, default=True)
    is_flat = Column(Boolean, default=False)
    difficulty = Column(String, default="easy")  # easy, moderate, hard

    # AI-generated
    is_ai_generated = Column(Boolean, default=False)
    ai_prompt = Column(Text, nullable=True)
    coffee_stops = Column(JSON, default=list)
    points_of_interest = Column(JSON, default=list)

    # Source
    source = Column(String, default="user")  # user, ai, veloway, community
    veloway_id = Column(String, nullable=True)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    favorites = relationship("FavoriteRoute", back_populates="route", cascade="all, delete-orphan")
    history = relationship("RouteHistory", back_populates="route", cascade="all, delete-orphan")


class FavoriteRoute(Base):
    """User's favorite/saved routes."""
    __tablename__ = "favorite_routes"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    route_id = Column(String, ForeignKey("routes.id", ondelete="CASCADE"))

    # Custom name
    nickname = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="favorite_routes")
    route = relationship("Route", back_populates="favorites")


class RouteHistory(Base):
    """User's ride history."""
    __tablename__ = "route_history"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    route_id = Column(String, ForeignKey("routes.id", ondelete="CASCADE"), nullable=True)

    # Ride data
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    actual_polyline = Column(Text, nullable=True)  # GPS track

    # Metrics
    distance_km = Column(Float, default=0.0)
    duration_minutes = Column(Integer, default=0)
    avg_speed = Column(Float, default=0.0)
    max_speed = Column(Float, default=0.0)
    elevation_gain = Column(Float, default=0.0)

    # Calculated
    co2_saved = Column(Float, default=0.0)
    calories_burned = Column(Integer, default=0)
    points_earned = Column(Integer, default=0)

    # Status
    is_completed = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="route_history")
    route = relationship("Route", back_populates="history")
