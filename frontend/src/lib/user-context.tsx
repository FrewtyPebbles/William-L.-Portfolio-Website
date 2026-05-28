import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { UserData } from '@/types/users'

type UserContextValue = [UserData|null, boolean]

const UserContext = createContext<UserContextValue>([null,true])

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData|null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/me`)
      .then(u => u.ok ? u.json() : null)
      .then((u) => {
        setUser(u)
        setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <UserContext.Provider value={[ user, loading ]}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
