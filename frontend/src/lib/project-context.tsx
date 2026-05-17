import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { get_project_url } from './utils'
import { ProjectConfig } from '@/types/project'

interface Resume {
  id: number
  title: string
  src: string
  nav_description: string
  created_at: string
}

interface ProjectContextValue {
  projects: {[key:string]: ProjectConfig}
  resumes: Resume[]
  loading: boolean
}

const ProjectContext = createContext<ProjectContextValue>({
  projects: {},
  resumes: [],
  loading: true,
})

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<{[key:string]: ProjectConfig}>({})
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(get_project_url("projects.json")).then(r => r.ok ? r.json() : {}),
      fetch('/api/resumes').then(r => r.ok ? r.json() : []),
    ]).then(([p, r]) => {
      setProjects(p)
      setResumes(r)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <ProjectContext.Provider value={{ projects, resumes, loading }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjects() {
  return useContext(ProjectContext)
}
