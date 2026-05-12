import { Routes, Route, Outlet } from 'react-router-dom'
import { NavBar } from '@/components/nav-bar'
import TailwindDarkmodeFix from '@/components/tailwind-darkmode-fix'
import Home from '@/pages/Home'
import About from '@/pages/About'
import ProjectDetail from '@/pages/ProjectDetail'
import AdminLogin from '@/pages/AdminLogin'
import AdminPortal from '@/pages/AdminPortal'
import AdminLayout from '@/pages/AdminLayout'
import NewProject from '@/pages/NewProject'
import EditProject from '@/pages/EditProject'
import NewResume from '@/pages/NewResume'
import EditResume from '@/pages/EditResume'
import NewPublicFile from '@/pages/NewPublicFile'
import EditPublicFile from '@/pages/EditPublicFile'
import { ProjectProvider } from '@/lib/project-context'

function MainLayout() {
  return (
    <>
      <ProjectProvider>
        <div className="flex flex-col min-h-screen">
          <div className="h-10" />
          <NavBar className="" />
          <main className="flex-1 w-full">
            <Outlet />
          </main>
        </div>
        <TailwindDarkmodeFix />
      </ProjectProvider>
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/portal" element={<AdminLayout />}>
          <Route index element={<AdminPortal />} />
          <Route path="projects/new" element={<NewProject />} />
          <Route path="projects/:id" element={<EditProject />} />
          <Route path="resumes/new" element={<NewResume />} />
          <Route path="resumes/:id" element={<EditResume />} />
          <Route path="public_files/new" element={<NewPublicFile />} />
          <Route path="public_files/:id" element={<EditPublicFile />} />
        </Route>
      </Route>
    </Routes>
  )
}
