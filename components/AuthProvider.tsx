'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type WhopUser = {
  id: string
  email: string | null
  name: string
  username: string
  profilePictureUrl: string | null
}

type AuthContextType = {
  user: WhopUser | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<WhopUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch Whop user from our API endpoint
    fetch('/api/whop/user')
      .then(res => res.json())
      .then(data => {
        setUser(data.user ?? null)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching Whop user:', error)
        setUser(null)
        setLoading(false)
      })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
