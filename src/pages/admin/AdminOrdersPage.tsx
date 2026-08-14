import { useMemo, useState } from 'react'
import { useStore } from '@/context/StoreContext'
import type { OrderStatus } from '@/lib/types'
import { confirmDelete, formatDate, formatTaka } from '@/lib/utils'

const statuses: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]

const statusLabel: Record<OrderStatus, string> = {
  pending: 'New',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export function AdminOrdersPage() {
  const { orders, updateOrderStatus, deleteOrder } = useStore()
  const [filter, setFilter] = useState<'all' | OrderStatus>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const list = useMemo(
    () => (filter === 'all' ? orders : orders.filter((order) => order.status === filter)),
    [filter, orders],
  )

  return (
    <div>
      <h1 className="font-display text-3xl text-gold">Orders</h1>
      <p className="mt-1 text-zinc-400">{orders.length} orders</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-full px-3 py-1 text-sm ${filter === 'all' ? 'bg-gold text-leaf-deep' : 'bg-white/10'}`}
        >
          All
        </button>
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`rounded-full px-3 py-1 text-sm ${filter === status ? 'bg-gold text-leaf-deep' : 'bg-white/10'}`}
          >
            {statusLabel[status]}
          </button>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {list.map((order) => (
          <article key={order.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold">{order.customerName}</p>
                <p className="text-sm text-zinc-400">
                  {order.phone} · {order.district} · {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-gold">{formatTaka(order.total)}</p>
                <select
                  value={order.status}
                  onChange={(e) => void updateOrderStatus(order.id, e.target.value as OrderStatus)}
                  className="mt-1 rounded-lg bg-black/40 px-2 py-1 text-sm"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {statusLabel[status]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="button"
              className="mt-3 text-sm text-gold"
              onClick={() => setOpenId(openId === order.id ? null : order.id)}
            >
              {openId === order.id ? 'Close' : 'Details'}
            </button>
            <button
              type="button"
              className="ml-4 mt-3 text-sm text-red-400"
              onClick={() => {
                if (!confirmDelete(order.customerName)) return
                void deleteOrder(order.id)
              }}
            >
              Delete
            </button>
            {openId === order.id && (
              <div className="mt-3 space-y-2 border-t border-white/10 pt-3 text-sm">
                <p>
                  {order.address}, {order.district}
                </p>
                <p>Shipping: {order.shippingType === 'upazila' ? 'Upazila' : 'District'} ({formatTaka(order.shippingFee)})</p>
                {order.items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <img src={item.image} alt="" className="size-10 rounded object-cover" />
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span className="ml-auto">{formatTaka(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
        {!list.length && <p className="py-10 text-center text-zinc-500">No orders</p>}
      </div>
    </div>
  )
}
