from pydantic import BaseModel
from enum import Enum

# PROJECTS

class ProjectProgress(str, Enum):
    PROTOTYPING = "PROTOTYPING"
    DEVELOPMENT = "DEVELOPMENT"
    ALPHA = "ALPHA"
    BETA = "BETA"
    RELEASE = "RELEASE"

class ProjectContributionLevel(str, Enum):
    EXTRA_SMALL = "EXTRA_SMALL"
    SMALL = "SMALL"
    MEDIUM = "MEDIUM"
    LARGE = "LARGE"
    EXTRA_LARGE = "EXTRA_LARGE"
    EVERYTHING = "EVERYTHING"
    NON_APPLICABLE = "NON_APPLICABLE"

class ProjectImage(BaseModel):
    title:str
    description:str
    path:str

class ProjectLink(BaseModel):
    title:str
    link:str
    description:str

class ProjectContributor(BaseModel):
    level:ProjectContributionLevel
    github_username:str
    name:str
    description:str

class ProjectConfig(BaseModel):
    title:str
    slug:str
    progress:ProjectProgress
    images:list[ProjectImage]
    links:list[ProjectLink]
    contributors:list[ProjectContributor]
    nav_description:str

# RESUMES

class ResumeConfig(BaseModel):
    title:str
    nav_description:str
    path:str