import { useMemo, useState } from 'react'
import { useConfirm } from '@/components/admin/ConfirmDialog'
import { useStore } from '@/context/StoreContext'
import { SHIPPING } from '@/lib/districts'
import { groupOrdersForAdmin } from '@/lib/mergeOrder'
import type { OrderStatus } from '@/lib/types'
import { formatDate, formatTaka } from '@/lib/utils'

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
  const confirm = useConfirm()
  const [filter, setFilter] = useState<'all' | OrderStatus>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const grouped = useMemo(() => groupOrdersForAdmin(orders), [orders])
  const list = useMemo(
    () => (filter === 'all' ? grouped : grouped.filter((row) => row.order.status === filter)),
    [filter, grouped],
  )

  async function setStatus(ids: string[], status: OrderStatus) {
    for (const id of ids) await updateOrderStatus(id, status)
  }

  async function remove(ids: string[], name: string) {
    if (!(await confirm(`Delete order for ${name}? This cannot be undone.`))) return
    for (const id of ids) await deleteOrder(id)
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-gold">Orders</h1>
      <p className="mt-1 text-zinc-400">{list.length} shown · same name, number and district stay together until confirm/cancel</p>
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
        {list.map((row) => {
          const order = row.order
          const qty = order.items.reduce((sum, item) => sum + item.quantity, 0)
          return (
            <article key={row.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold">{order.customerName}</p>
                  <p className="text-sm text-gold">
                    {order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}
                  </p>
                  <p className="text-xs font-semibold text-amber-300">মোট {qty} টি অর্ডার</p>
                  <p className="text-sm text-zinc-400">
                    {order.phone} · {order.district}
                  </p>
                  <p className="text-xs text-zinc-500">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-gold">{formatTaka(order.total)}</p>
                  <select
                    value={order.status}
                    onChange={(e) => void setStatus(row.ids, e.target.value as OrderStatus)}
                    className="admin-select mt-1 rounded-lg bg-[#0b1210] px-2 py-1 text-sm text-zinc-100"
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
                onClick={() => setOpenId(openId === row.key ? null : row.key)}
              >
                {openId === row.key ? 'Close' : 'Details'}
              </button>
              <button
                type="button"
                className="ml-4 mt-3 text-sm text-red-400"
                onClick={() => void remove(row.ids, order.customerName)}
              >
                Delete
              </button>
              {openId === row.key && (
                <div className="mt-3 space-y-2 border-t border-white/10 pt-3 text-sm">
                  <p>
                    {order.address}, {order.district}
                  </p>
                  <p>Shipping: {SHIPPING[order.shippingType]?.label ?? order.shippingType} ({formatTaka(order.shippingFee)})</p>
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
          )
        })}
        {!list.length && <p className="py-10 text-center text-zinc-500">No orders</p>}
      </div>
    </div>
  )
}
