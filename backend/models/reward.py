"""
Reward Models - Points, Badges, Rewards
"""
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Points(Base):
    """Points transaction history."""
    __tablename__ = "points"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))

    amount = Column(Integer, nullable=False)  # Can be negative for redemptions
    reason = Column(String, nullable=False)
    category = Column(String, default="other")  # ride, education, community, redemption, bonus

    # Reference
    reference_type = Column(String, nullable=True)  # module, quiz, ride, reward
    reference_id = Column(String, nullable=True)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="points_history")


class Badge(Base):
    """Available badges/achievements."""
    __tablename__ = "badges"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String, default="🏆")
    category = Column(String, default="general")  # education, community, riding, special

    # Requirements
    requirement_type = Column(String, nullable=True)  # points, rides, modules, etc.
    requirement_value = Column(Integer, nullable=True)

    # Rewards
    points_reward = Column(Integer, default=0)

    # Display
    is_hidden = Column(Boolean, default=False)  # Secret badges
    sort_order = Column(Integer, default=0)

    # Relationships
    user_badges = relationship("UserBadge", back_populates="badge", cascade="all, delete-orphan")


class UserBadge(Base):
    """Badges earned by users."""
    __tablename__ = "user_badges"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    badge_id = Column(String, ForeignKey("badges.id", ondelete="CASCADE"))

    # When earned
    earned_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="badges")
    badge = relationship("Badge", back_populates="user_badges")


class Reward(Base):
    """Redeemable rewards (e-bike discounts, etc)."""
    __tablename__ = "rewards"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String, default="🎁")
    category = Column(String, default="discount")  # discount, product, experience

    # Cost
    points_cost = Column(Integer, nullable=False)

    # Value
    discount_type = Column(String, default="fixed")  # fixed, percentage
    discount_value = Column(Float, nullable=False)  # Dollar amount or percentage

    # Restrictions
    min_purchase = Column(Float, default=0.0)
    max_uses = Column(Integer, nullable=True)  # Total available
    uses_remaining = Column(Integer, nullable=True)
    valid_days = Column(Integer, default=90)  # Days until expiry

    # Partner
    partner_name = Column(String, nullable=True)
    partner_logo = Column(String, nullable=True)

    # Display
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    redeemed = relationship("RedeemedReward", back_populates="reward", cascade="all, delete-orphan")


class RedeemedReward(Base):
    """Rewards redeemed by users."""
    __tablename__ = "redeemed_rewards"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    reward_id = Column(String, ForeignKey("rewards.id", ondelete="CASCADE"))

    # Discount code
    code = Column(String, unique=True, nullable=False)
    points_spent = Column(Integer, nullable=False)

    # Status
    is_used = Column(Boolean, default=False)
    used_at = Column(DateTime, nullable=True)

    # Validity
    expires_at = Column(DateTime, nullable=False)

    # Timestamps
    redeemed_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="redeemed_rewards")
    reward = relationship("Reward", back_populates="redeemed")
