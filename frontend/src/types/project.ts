export enum ProjectProgress {
  PROTOTYPING = "PROTOTYPING",
  DEVELOPMENT = "DEVELOPMENT",
  ALPHA = "ALPHA",
  BETA = "BETA",
  RELEASE = "RELEASE",
}

export enum ProjectContributionLevel {
  EXTRA_SMALL = "EXTRA_SMALL",
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
  EXTRA_LARGE = "EXTRA_LARGE",
  EVERYTHING = "EVERYTHING",
  NON_APPLICABLE = "NON_APPLICABLE",
}

export interface ProjectImage {
  title: string
  description: string
  path: string
}

export interface ProjectLink {
  title: string
  link: string
  description: string
}

export interface ProjectContributor {
  level: ProjectContributionLevel
  github_username: string
  name: string
  description: string
}

export interface ProjectConfig {
  title: string
  slug: string
  progress: ProjectProgress
  images: ProjectImage[]
  links: ProjectLink[]
  contributors: ProjectContributor[]
  nav_description: string
}