import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { get_project_url, get_resume_url } from './utils'
import { ProjectConfig } from '@/types/project'
import { ResumeConfig } from '@/types/resume'


interface NavContextValue {
  projects: {[key:string]: ProjectConfig}
  resumes: {[key:string]: ResumeConfig}
  loading: boolean
}

const NavContext = createContext<NavContextValue>({
  projects: {},
  resumes: {},
  loading: true,
})

export function NavProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<{[key:string]: ProjectConfig}>({})
  const [resumes, setResumes] = useState<{[key:string]: ResumeConfig}>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(get_project_url("projects.json")).then(r => r.ok ? r.json() : {}),
      fetch(get_resume_url("resumes.json")).then(r => r.ok ? r.json() : {}),
    ]).then(([p, r]) => {
      setProjects(p)
      setResumes(r)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <NavContext.Provider value={{ projects, resumes, loading }}>
      {children}
    </NavContext.Provider>
  )
}

export function useNav() {
  return useContext(NavContext)
}
