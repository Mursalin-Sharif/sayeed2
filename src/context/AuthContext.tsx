import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase'

const KEY = 'js-agro-shop-admin'
const demoEmail = import.meta.env.VITE_ADMIN_EMAIL || 'jsagroshop63@gmail.com'
const demoPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'

type AuthContextValue = {
  isAdmin: boolean
  login: (email: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem(KEY) === '1')

  const login = useCallback(async (email: string, password: string) => {
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return error.message
      localStorage.setItem(KEY, '1')
      setIsAdmin(true)
      return null
    }
    if (email.trim().toLowerCase() === demoEmail.toLowerCase() && password === demoPassword) {
      localStorage.setItem(KEY, '1')
      setIsAdmin(true)
      return null
    }
    return 'Incorrect email or password'
  }, [])

  const logout = useCallback(async () => {
    localStorage.removeItem(KEY)
    setIsAdmin(false)
    await supabase?.auth.signOut()
  }, [])

  const value = useMemo(() => ({ isAdmin, login, logout }), [isAdmin, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
