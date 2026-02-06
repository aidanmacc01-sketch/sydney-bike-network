"""
Education Models - Modules, Quizzes, Progress
"""
from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Module(Base):
    """Educational modules/lessons."""
    __tablename__ = "modules"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String, default="📚")
    category = Column(String, default="safety")  # safety, rules, ebike, commuting, security

    # Content
    sections = Column(JSON, default=list)  # [{title, content}, ...]
    estimated_minutes = Column(Integer, default=10)

    # Rewards
    points_reward = Column(Integer, default=100)
    badge_id = Column(String, ForeignKey("badges.id"), nullable=True)

    # Requirements
    prerequisite_module_id = Column(String, nullable=True)
    is_premium = Column(Boolean, default=False)

    # Display
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    quizzes = relationship("Quiz", back_populates="module", cascade="all, delete-orphan")
    progress = relationship("UserModuleProgress", back_populates="module", cascade="all, delete-orphan")


class Quiz(Base):
    """Quizzes for modules."""
    __tablename__ = "quizzes"

    id = Column(String, primary_key=True)
    module_id = Column(String, ForeignKey("modules.id", ondelete="CASCADE"))
    title = Column(String, nullable=False)

    # Settings
    passing_score = Column(Integer, default=70)  # Percentage
    time_limit_minutes = Column(Integer, nullable=True)
    max_attempts = Column(Integer, nullable=True)

    # Rewards
    points_reward = Column(Integer, default=50)

    # Display
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    module = relationship("Module", back_populates="quizzes")
    questions = relationship("QuizQuestion", back_populates="quiz", cascade="all, delete-orphan")
    attempts = relationship("UserQuizAttempt", back_populates="quiz", cascade="all, delete-orphan")


class QuizQuestion(Base):
    """Questions for quizzes."""
    __tablename__ = "quiz_questions"

    id = Column(String, primary_key=True)
    quiz_id = Column(String, ForeignKey("quizzes.id", ondelete="CASCADE"))

    # Question
    question_text = Column(Text, nullable=False)
    question_type = Column(String, default="multiple_choice")  # multiple_choice, true_false

    # Options (for multiple choice)
    options = Column(JSON, default=list)  # ["Option A", "Option B", ...]
    correct_answer = Column(Integer, nullable=False)  # Index of correct option

    # Explanation
    explanation = Column(Text, nullable=True)

    # Display
    sort_order = Column(Integer, default=0)

    # Relationships
    quiz = relationship("Quiz", back_populates="questions")


class UserModuleProgress(Base):
    """User's progress through modules."""
    __tablename__ = "user_module_progress"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    module_id = Column(String, ForeignKey("modules.id", ondelete="CASCADE"))

    # Progress
    current_section = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)
    completion_percentage = Column(Integer, default=0)

    # Points
    points_earned = Column(Integer, default=0)

    # Timestamps
    started_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)
    last_accessed = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="module_progress")
    module = relationship("Module", back_populates="progress")


class UserQuizAttempt(Base):
    """User's quiz attempts."""
    __tablename__ = "user_quiz_attempts"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    quiz_id = Column(String, ForeignKey("quizzes.id", ondelete="CASCADE"))

    # Results
    score = Column(Integer, default=0)  # Percentage
    correct_answers = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    is_passed = Column(Boolean, default=False)

    # Answers
    answers = Column(JSON, default=list)  # [{question_id, selected, correct}, ...]

    # Duration
    started_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)

    # Points
    points_earned = Column(Integer, default=0)

    # Relationships
    user = relationship("User", back_populates="quiz_attempts")
    quiz = relationship("Quiz", back_populates="attempts")
