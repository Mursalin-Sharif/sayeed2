import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  Package,
  ShoppingBag,
  Users,
  PanelsTopLeft,
  X,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/messages', label: 'Messages', icon: Mail },
  { to: '/admin/media', label: 'Media', icon: Images },
  { to: '/admin/landing', label: 'Landing', icon: Megaphone },
  { to: '/admin/carousel', label: 'Carousel', icon: PanelsTopLeft },
]

export function AdminLayout() {
  const { isAdmin, logout } = useAuth()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const current = links.find((link) =>
    link.end ? pathname === link.to : pathname.startsWith(link.to),
  )

  if (!isAdmin) return <Navigate to="/admin/login" replace />

  return (
    <div className="min-h-svh bg-[#0f1714] text-zinc-100">
      <div className="mx-auto flex max-w-7xl gap-0 md:gap-6">
        <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-white/10 p-4 md:flex">
          <p className="mb-6 font-display text-2xl text-gold">Admin CMS</p>
          <nav className="flex flex-1 flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${isActive ? 'bg-leaf text-gold' : 'hover:bg-white/5'}`
                }
              >
                <link.icon className="size-4" />
                {link.label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => void logout()}
            className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-300 hover:bg-white/5"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </aside>
        <div className="min-w-0 flex-1 p-4 md:p-8">
          <div className="relative mb-4 md:hidden">
            <div className="flex items-center justify-between rounded-2xl border border-gold/50 bg-leaf px-3 py-2 shadow-lg shadow-gold/10">
              <p className="font-semibold text-gold">{current?.label ?? 'Menu'}</p>
              <button
                type="button"
                className="rounded-xl bg-gold/15 p-2 text-gold"
                onClick={() => setOpen((value) => !value)}
                aria-label="Admin menu"
              >
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
            {open && (
              <nav className="absolute inset-x-0 top-[calc(100%+8px)] z-50 rounded-2xl border border-white/10 bg-[#121c18] p-2 shadow-xl">
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-xl px-3 py-3 text-sm ${isActive ? 'bg-leaf text-gold' : 'hover:bg-white/5'}`
                    }
                  >
                    <link.icon className="size-4" />
                    {link.label}
                  </NavLink>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    void logout()
                  }}
                  className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm text-red-300 hover:bg-white/5"
                >
                  <LogOut className="size-4" />
                  Logout
                </button>
              </nav>
            )}
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
