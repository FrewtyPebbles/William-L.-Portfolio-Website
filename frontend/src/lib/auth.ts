const TOKEN_KEY = 'admin_access_token'


export async function isAuthenticated(): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/check', { 
      method: 'GET',
      credentials: 'same-origin' 
    })
    return res.ok
  } catch {
    return false
  }
}

export async function login(username: string, password: string) {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Login failed' }))
    throw new Error(err.error || 'Login failed')
  }

}
