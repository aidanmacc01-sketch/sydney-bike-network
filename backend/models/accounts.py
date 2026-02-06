"""
Micro2Move - Accounts/Financial Models (BCNF Normalized)
"""
from sqlalchemy import Column, String, DateTime, SmallInteger, Numeric, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid


class AccountsType(Base):
    """Accounts type master table."""
    __tablename__ = "accounts_type"
    __table_args__ = {"schema": "micro2move"}

    accounts_type_id = Column(SmallInteger, primary_key=True, autoincrement=True)
    accounts_type_name = Column(Text, unique=True, nullable=False)

    # Relationships
    accounts = relationship("Accounts", back_populates="accounts_type")


class Accounts(Base):
    """Financial ledger entries (tied to booking)."""
    __tablename__ = "accounts"
    __table_args__ = {"schema": "micro2move"}

    accounts_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = Column(String, ForeignKey("micro2move.booking.booking_id", ondelete="CASCADE"), nullable=False)
    amount_credit = Column(Numeric(12, 2), nullable=False)
    accounts_type_id = Column(SmallInteger, ForeignKey("micro2move.accounts_type.accounts_type_id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    note = Column(Text, nullable=True)

    # Relationships
    booking = relationship("Booking", back_populates="accounts")
    accounts_type = relationship("AccountsType", back_populates="accounts")
