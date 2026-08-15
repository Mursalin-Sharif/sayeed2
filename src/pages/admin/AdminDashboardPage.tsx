import { Link } from 'react-router-dom'
import { useStore } from '@/context/StoreContext'
import { formatTaka } from '@/lib/utils'

const statusLabel: Record<string, string> = {
  pending: 'New',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export function AdminDashboardPage() {
  const { orders, products, customers } = useStore()
  const revenue = orders
    .filter((order) => order.status !== 'cancelled')
    .reduce((sum, order) => sum + order.total, 0)
  const pending = orders.filter((order) => order.status === 'pending').length

  const cards = [
    { label: 'Total orders', value: String(orders.length), to: '/admin/orders' },
    { label: 'New orders', value: String(pending), to: '/admin/orders' },
    { label: 'Revenue', value: formatTaka(revenue), to: '/admin/orders' },
    { label: 'Customers', value: String(customers.length), to: '/admin/customers' },
    { label: 'Products', value: String(products.length), to: '/admin/products' },
  ]

  return (
    <div>
      <h1 className="font-display text-3xl text-gold">Dashboard</h1>
      <p className="mt-1 text-zinc-400">Orders, sales and customer overview</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-gold/40 hover:bg-white/10"
          >
            <p className="text-xs text-zinc-400">{card.label}</p>
            <p className="mt-2 text-2xl font-bold">{card.value}</p>
          </Link>
        ))}
      </div>
      <div className="mt-10 overflow-hidden rounded-2xl border border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="font-semibold">Recent orders</h2>
          <Link to="/admin/orders" className="text-sm text-gold">
            View all
          </Link>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-zinc-400">
            <tr>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 8).map((order) => (
              <tr key={order.id} className="border-t border-white/10">
                <td className="px-4 py-2">
                  <Link to="/admin/orders" className="font-semibold text-gold hover:underline">
                    {order.customerName}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  <a href={`tel:${order.phone}`} className="hover:text-gold">
                    {order.phone}
                  </a>
                </td>
                <td className="px-4 py-2">{formatTaka(order.total)}</td>
                <td className="px-4 py-2">{statusLabel[order.status] ?? order.status}</td>
              </tr>
            ))}
            {!orders.length && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  No orders yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
