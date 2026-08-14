import { NavLink } from 'react-router-dom'
import { Home, Phone, ShoppingCart } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { cn } from '@/lib/utils'

const tabClass =
  'flex min-w-0 flex-col items-center justify-center gap-0.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white/90'

export function MobileBottomNav() {
  const { count } = useCart()

  return (
    <nav
      aria-label="মোবাইল নেভিগেশন"
      className="fixed bottom-0 left-0 right-0 z-[1001] grid min-h-[55px] grid-cols-3 justify-around rounded-t-xl bg-leaf-deep px-2 pt-1.5 pb-[max(0.35rem,env(safe-area-inset-bottom))] lg:hidden"
      style={{ height: 'calc(55px + env(safe-area-inset-bottom, 0px))' }}
    >
      <NavLink
        to="/contact"
        className={({ isActive }) => cn(tabClass, isActive && 'text-gold')}
      >
        <Phone className="size-5" />
        CONTACT
      </NavLink>

      <NavLink
        to="/"
        end
        className={({ isActive }) => cn(tabClass, isActive && 'text-gold')}
      >
        <span className="-mt-5 grid size-11 place-items-center rounded-full bg-gold text-leaf-deep shadow-lg ring-4 ring-leaf-deep">
          <Home className="size-5" />
        </span>
        HOME
      </NavLink>

      <NavLink
        to="/cart"
        className={({ isActive }) => cn(tabClass, isActive && 'text-gold')}
      >
        <span className="relative">
          <ShoppingCart className="size-5" />
          {count > 0 && (
            <span className="absolute -right-2 -top-1.5 grid min-w-4 place-items-center rounded-full bg-gold px-1 text-[9px] font-bold text-leaf-deep">
              {count}
            </span>
          )}
        </span>
        CART
      </NavLink>
    </nav>
  )
}
