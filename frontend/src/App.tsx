import { Routes, Route, Outlet } from 'react-router-dom'
import { NavBar } from '@/components/nav-bar'
import TailwindDarkmodeFix from '@/components/tailwind-darkmode-fix'
import Home from '@/pages/Home'
import About from '@/pages/About'
import ProjectDetail from '@/pages/ProjectDetail'
import AdminLogin from '@/pages/AdminLogin'
import { NavProvider } from '@/lib/nav-context'
import { CommentsProvider } from '@/lib/comments-context'

function MainLayout() {
  return (
    <>
      <CommentsProvider>
        <NavProvider>
          <div className="flex flex-col min-h-screen">
            <div className="h-10" />
            <NavBar className="" />
            <main className="flex-1 w-full">
              <Outlet />
            </main>
          </div>
          <TailwindDarkmodeFix />
        </NavProvider>
      </CommentsProvider>
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
      </Route>
    </Routes>
  )
}
