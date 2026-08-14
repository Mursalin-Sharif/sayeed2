import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function AdminLoginPage() {
  const { isAdmin, login } = useAuth()
  const [email, setEmail] = useState('jsagroshop63@gmail.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAdmin) return <Navigate to="/admin" replace />

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    const message = await login(email, password)
    setError(message ?? '')
    setLoading(false)
  }

  return (
    <div className="grid min-h-svh place-items-center bg-leaf-deep px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl bg-white p-8 text-ink shadow-xl">
        <h1 className="font-display text-3xl text-leaf">Admin login</h1>
        <p className="mt-1 text-sm text-ink/60">Manage dashboard, products, orders and customers</p>
        <label className="mt-6 block text-sm font-semibold">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border px-4 py-3"
          />
        </label>
        <label className="mt-4 block text-sm font-semibold">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border px-4 py-3"
          />
        </label>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-leaf py-3 font-bold text-gold"
        >
          {loading ? 'Checking...' : 'Login'}
        </button>
        <p className="mt-4 text-xs text-ink/50">Demo: jsagroshop63@gmail.com / admin123</p>
      </form>
    </div>
  )
}
