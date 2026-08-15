import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  Banknote,
  Images,
  Mail,
  Megaphone,
  Package,
  Plus,
  ShoppingBag,
  Users,
} from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { SITE } from '@/lib/seed'
import { groupOrdersForAdmin } from '@/lib/mergeOrder'
import { cn, formatDate, formatTaka } from '@/lib/utils'

const statusLabel: Record<string, string> = {
  pending: 'New',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const statusClass: Record<string, string> = {
  pending: 'bg-amber-400/15 text-amber-300',
  confirmed: 'bg-sky-400/15 text-sky-300',
  processing: 'bg-violet-400/15 text-violet-300',
  shipped: 'bg-blue-400/15 text-blue-300',
  delivered: 'bg-emerald-400/15 text-emerald-300',
  cancelled: 'bg-red-400/15 text-red-300',
}

export function AdminDashboardPage() {
  const { orders, products, customers, messages } = useStore()
  const groupedOrders = groupOrdersForAdmin(orders)
  const revenue = orders
    .filter((order) => order.status !== 'cancelled')
    .reduce((sum, order) => sum + order.total, 0)
  const pending = orders.filter((order) => order.status === 'pending').length
  const unread = (messages ?? []).filter((item) => !item.read).length
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const cards = [
    { label: 'Total orders', value: String(orders.length), to: '/admin/orders', icon: ShoppingBag, tone: 'text-gold bg-gold/10' },
    { label: 'New orders', value: String(pending), to: '/admin/orders', icon: ShoppingBag, tone: 'text-amber-300 bg-amber-400/10' },
    { label: 'Revenue', value: formatTaka(revenue), to: '/admin/orders', icon: Banknote, tone: 'text-emerald-300 bg-emerald-400/10' },
    { label: 'Customers', value: String(customers.length), to: '/admin/customers', icon: Users, tone: 'text-sky-300 bg-sky-400/10' },
    { label: 'Products', value: String(products.length), to: '/admin/products', icon: Package, tone: 'text-leaf-mid bg-leaf-mid/15' },
  ]

  const actions = [
    { to: '/admin/products', label: 'Add product', icon: Plus },
    { to: '/admin/orders', label: 'Manage orders', icon: ShoppingBag },
    { to: '/admin/messages', label: unread ? `Inbox (${unread})` : 'Inbox', icon: Mail },
    { to: '/admin/media', label: 'Landing media', icon: Images },
    { to: '/admin/landing', label: 'Edit offer page', icon: Megaphone },
  ]

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-leaf via-[#0d2a22] to-[#071410] p-6 shadow-lg shadow-black/20 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-gold/10 blur-3xl" />
        <p className="text-xs font-semibold tracking-[0.2em] text-gold/80 uppercase">{today}</p>
        <h1 className="font-display mt-2 text-3xl text-gold sm:text-4xl">Welcome back</h1>
        <p className="mt-2 max-w-xl text-sm text-cream/75 sm:text-base">
          {SITE.name} admin — orders, products and the offer page in one place.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-bold text-leaf-deep"
          >
            <Plus className="size-4" />
            New product
          </Link>
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-cream hover:bg-white/5"
          >
            View shop
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-gold/35 hover:bg-white/[0.07]"
          >
            <div className="flex items-start justify-between">
              <span className={cn('grid size-10 place-items-center rounded-xl', card.tone)}>
                <card.icon className="size-5" />
              </span>
              <ArrowUpRight className="size-4 text-zinc-500 transition group-hover:text-gold" />
            </div>
            <p className="mt-4 text-xs tracking-wide text-zinc-400 uppercase">{card.label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 hover:border-gold/40 hover:text-gold"
          >
            <action.icon className="size-4" />
            {action.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h2 className="font-display text-2xl text-gold">Recent orders</h2>
              <p className="text-xs text-zinc-500">Latest {Math.min(8, orders.length)} of {orders.length}</p>
            </div>
            <Link to="/admin/orders" className="text-sm font-semibold text-gold hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs tracking-wide text-zinc-500 uppercase">
                <tr>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {groupedOrders.slice(0, 8).map((row) => (
                  <tr key={row.key} className="border-t border-white/10 hover:bg-white/[0.03]">
                    <td className="px-5 py-3">
                      <Link to="/admin/orders" className="font-semibold hover:text-gold">
                        {row.order.customerName}
                      </Link>
                      <p className="text-xs text-zinc-500">
                        {row.order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}
                      </p>
                      <p className="text-xs text-zinc-500">{formatDate(row.order.createdAt)}</p>
                    </td>
                    <td className="px-5 py-3">
                      <a href={`tel:${row.order.phone}`} className="hover:text-gold">
                        {row.order.phone}
                      </a>
                    </td>
                    <td className="px-5 py-3 font-semibold text-gold">{formatTaka(row.order.total)}</td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                          statusClass[row.order.status] ?? 'bg-white/10 text-zinc-300',
                        )}
                      >
                        {statusLabel[row.order.status] ?? row.order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!orders.length && (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-zinc-500">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-gold">Inbox</h2>
            <Link to="/admin/messages" className="text-sm font-semibold text-gold hover:underline">
              Open
            </Link>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            {unread ? `${unread} unread message${unread > 1 ? 's' : ''}` : 'All caught up'}
          </p>
          <div className="mt-4 space-y-3">
            {(messages ?? []).slice(0, 4).map((item) => (
              <article
                key={item.id}
                className={cn(
                  'rounded-2xl border p-3',
                  item.read ? 'border-white/10 bg-white/5' : 'border-gold/30 bg-gold/10',
                )}
              >
                <p className="font-semibold">{item.name}</p>
                <p className="truncate text-xs text-zinc-400">{item.message}</p>
              </article>
            ))}
            {!(messages ?? []).length && <p className="py-8 text-center text-sm text-zinc-500">No messages</p>}
          </div>
        </section>
      </div>
    </div>
  )
}
