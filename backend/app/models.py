from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from .database import Base


class ProjectProgress(str, enum.Enum):
    PROTOTYPING = "PROTOTYPING"
    DEVELOPMENT = "DEVELOPMENT"
    ALPHA = "ALPHA"
    BETA = "BETA"
    RELEASE = "RELEASE"


class ContributionLevel(str, enum.Enum):
    EXTRA_SMALL = "EXTRA_SMALL"
    SMALL = "SMALL"
    MEDIUM = "MEDIUM"
    LARGE = "LARGE"
    EXTRA_LARGE = "EXTRA_LARGE"
    EVERYTHING = "EVERYTHING"
    NON_APPLICABLE = "NON_APPLICABLE"


class Project(Base):
    __tablename__ = "Project"

    id = Column(Integer, primary_key=True, autoincrement=True)
    slug = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    progress = Column(Enum(ProjectProgress), nullable=False)
    nav_description = Column(String, nullable=False)
    short_description = Column(Text, nullable=False)
    full_description = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    contributions = relationship("Contribution", back_populates="project", cascade="all, delete-orphan")
    links = relationship("ProjectSubLink", back_populates="project", cascade="all, delete-orphan")
    images = relationship("ProjectSubImage", back_populates="project", cascade="all, delete-orphan")
    project_sub_pages = relationship("ProjectSubPage", back_populates="project", cascade="all, delete-orphan")


class ProjectSubImage(Base):
    __tablename__ = "ProjectSubImage"

    id = Column(Integer, primary_key=True, autoincrement=True)
    src = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, default="")
    projectID = Column(Integer, ForeignKey("Project.id", ondelete="CASCADE"))

    project = relationship("Project", back_populates="images")


class ProjectSubLink(Base):
    __tablename__ = "ProjectSubLink"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    description = Column(String, default="")
    link = Column(String, nullable=False)
    projectID = Column(Integer, ForeignKey("Project.id", ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="links")


class ProjectSubPage(Base):
    __tablename__ = "ProjectSubPage"

    id = Column(Integer, primary_key=True, autoincrement=True)
    slug = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    nav_description = Column(String, default="")
    short_description = Column(String, default="")
    full_description = Column(Text, nullable=False)
    projectID = Column(Integer, ForeignKey("Project.id", ondelete="CASCADE"))

    project = relationship("Project", back_populates="project_sub_pages")


class Contribution(Base):
    __tablename__ = "Contribution"

    id = Column(Integer, primary_key=True, autoincrement=True)
    level = Column(Enum(ContributionLevel), nullable=False)
    description = Column(String, nullable=False)
    projectID = Column(Integer, ForeignKey("Project.id", ondelete="CASCADE"))
    contributorID = Column(Integer, ForeignKey("Contributor.id", ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="contributions")
    contributor = relationship("Contributor", back_populates="contributions")


class Contributor(Base):
    __tablename__ = "Contributor"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    githubUserName = Column(String, unique=True, default="none")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    contributions = relationship("Contribution", back_populates="contributor")


class Resume(Base):
    __tablename__ = "Resume"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    src = Column(String, unique=True, nullable=False)
    nav_description = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PublicFile(Base):
    __tablename__ = "PublicFile"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    src = Column(String, unique=True, nullable=False)
    tool_tip = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
