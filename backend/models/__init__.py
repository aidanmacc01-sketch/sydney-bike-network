"""
Micro2Move - Database Models (BCNF Normalized Schema)
"""
# User & Authorization
from models.user import User, Authorization, UserAuthorization, Supplier

# E-Bike Domain
from models.ebike import EBike, EBikeStatus, EBikeCategory, FeatureCheck, EBikeFeatureCheck, EBikeRating

# Booking & Operations
from models.booking import Booking, BookingStatus, Handover, BikeReturn, BookingCancellation

# Issues & Incidents
from models.issue import Issue, IssueFeatureCheck, Incident, InsuranceClaim

# Geo Location
from models.geo_location import GeoLocation, GeoLocationType

# Financial
from models.accounts import Accounts, AccountsType

__all__ = [
    # User & Authorization
    "User",
    "Authorization",
    "UserAuthorization",
    "Supplier",
    # E-Bike
    "EBike",
    "EBikeStatus",
    "EBikeCategory",
    "FeatureCheck",
    "EBikeFeatureCheck",
    "EBikeRating",
    # Booking
    "Booking",
    "BookingStatus",
    "Handover",
    "BikeReturn",
    "BookingCancellation",
    # Issues
    "Issue",
    "IssueFeatureCheck",
    "Incident",
    "InsuranceClaim",
    # Geo
    "GeoLocation",
    "GeoLocationType",
    # Financial
    "Accounts",
    "AccountsType",
]
