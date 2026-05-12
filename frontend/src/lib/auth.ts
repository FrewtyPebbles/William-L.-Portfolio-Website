const TOKEN_KEY = 'admin_access_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export function authHeaders(): Record<string, string> {
  const token = getToken()
  const headers: Record<string, string> = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export async function login(username: string, password: string): Promise<string> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Login failed' }))
    throw new Error(err.error || 'Login failed')
  }
  const data = await res.json()
  setToken(data.access_token)
  return data.access_token
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    ...authHeaders(),
    ...(options.headers as Record<string, string> || {}),
  }
  
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
  }

  const res = await fetch(path, { ...options, headers })

  if (res.status === 401) {
    clearToken()
    const currentPath = window.location.pathname
    if (!currentPath.startsWith('/admin/login')) {
      window.location.href = `/admin/login?from=${encodeURIComponent(currentPath)}`
    }
  }

  return res
}
