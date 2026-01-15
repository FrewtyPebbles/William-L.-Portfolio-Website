"use client"

import { useState } from "react"

export default function AdminLogin() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function login() {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    })

    console.log(res)

    if (!res.ok) {
      setError("Invalid password")
      return
    }

    window.location.href = "/admin/portal"
  }

  return (
    <div className="max-w-sm mx-auto mt-32 space-y-4">
      <h1 className="text-xl font-bold">Admin Login</h1>
      <input
        type="password"
        className="border p-2 w-full"
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={login} className="bg-black text-white px-4 py-2">
        Login
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
