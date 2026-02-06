"""
Micro2Move - Geo Location Models (BCNF Normalized)
"""
from sqlalchemy import Column, String, Date, SmallInteger, Numeric, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
import uuid


class GeoLocationType(Base):
    """Geo location type master table."""
    __tablename__ = "geo_location_type"
    __table_args__ = {"schema": "micro2move"}

    geo_location_type_id = Column(SmallInteger, primary_key=True, autoincrement=True)
    geo_location_type_name = Column(Text, unique=True, nullable=False)

    # Relationships
    locations = relationship("GeoLocation", back_populates="location_type")


class GeoLocation(Base):
    """Geo location (charging stations, bike stations, pickup/return points)."""
    __tablename__ = "geo_location"
    __table_args__ = {"schema": "micro2move"}

    geo_location_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    geo_location_name = Column(Text, nullable=False)
    geo_location_details = Column(Text, nullable=True)
    geo_location_postal_address = Column(Text, nullable=False)
    geo_location_type_id = Column(SmallInteger, ForeignKey("micro2move.geo_location_type.geo_location_type_id", ondelete="RESTRICT"), nullable=False)
    latitude = Column(Numeric(9, 6), nullable=True)
    longitude = Column(Numeric(9, 6), nullable=True)
    geo_location_start_date = Column(Date, nullable=True)
    geo_location_end_date = Column(Date, nullable=True)

    # Relationships
    location_type = relationship("GeoLocationType", back_populates="locations")
