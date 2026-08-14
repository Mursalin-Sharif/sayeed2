import { useStore } from '@/context/StoreContext'
import { formatDate, formatTaka } from '@/lib/utils'

export function AdminCustomersPage() {
  const { customers, orders } = useStore()

  return (
    <div>
      <h1 className="font-display text-3xl text-gold">Customers</h1>
      <p className="mt-1 text-zinc-400">{customers.length} customers · auto list from orders</p>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-zinc-400">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">District</th>
              <th className="px-4 py-2">Orders</th>
              <th className="px-4 py-2">Spent</th>
              <th className="px-4 py-2">Last order</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-t border-white/10">
                <td className="px-4 py-3">
                  <p className="font-semibold">{customer.name}</p>
                  <p className="text-xs text-zinc-500">{customer.address}</p>
                </td>
                <td className="px-4 py-3">{customer.phone}</td>
                <td className="px-4 py-3">{customer.district}</td>
                <td className="px-4 py-3">{customer.orderCount}</td>
                <td className="px-4 py-3">{formatTaka(customer.totalSpent)}</td>
                <td className="px-4 py-3">{formatDate(customer.lastOrderAt)}</td>
              </tr>
            ))}
            {!customers.length && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-zinc-500">
                  No customers yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-zinc-500">Total order records: {orders.length}</p>
    </div>
  )
}
