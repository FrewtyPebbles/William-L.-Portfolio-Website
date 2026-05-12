"use client"

import { useState } from "react"
import { login } from "@/lib/auth"
import { useNavigate } from "react-router-dom"

export default function AdminLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  async function handleLogin() {
    try {
      await login(username, password)
      navigate("/admin/portal")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed")
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-32 space-y-4">
      <h1 className="text-xl font-bold">Admin Login</h1>
      <input
        type="text"
        className="border p-2 w-full"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input
        type="password"
        className="border p-2 w-full"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={handleLogin} className="bg-black text-white px-4 py-2">
        Login
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
