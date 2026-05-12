"use client"

import { Outlet, Link, useNavigate } from "react-router-dom"
import { clearToken, isAuthenticated } from "@/lib/auth"
import { useEffect } from "react"

export default function AdminLayout() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/admin/login?from=/admin/portal")
    }
  }, [navigate])

  function handleLogout() {
    clearToken()
    navigate("/admin/login")
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r p-4 space-y-4">
        <h1 className="font-bold text-lg">Admin</h1>
        <nav className="flex flex-col gap-2">
          <Link to="/admin/portal" className="underline">Dashboard</Link>
        </nav>
        <button className="text-red-600" onClick={handleLogout}>Logout</button>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
