import { Link, useLocation, useParams } from 'react-router-dom'
import { useStore } from '@/context/StoreContext'
import { SHIPPING } from '@/lib/districts'
import type { Order } from '@/lib/types'
import { formatTaka } from '@/lib/utils'
import { CheckCircle2 } from 'lucide-react'

export function OrderSuccessPage() {
  const { id } = useParams()
  const { orders } = useStore()
  const location = useLocation()
  const fromState = (location.state as { order?: Order } | null)?.order
  const order = fromState ?? orders.find((item) => item.id === id)

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <CheckCircle2 className="mx-auto size-16 text-leaf-mid" />
      <h1 className="font-display mt-4 text-4xl text-leaf">অর্ডার সম্পন্ন হয়েছে!</h1>
      <p className="mt-3 text-ink/70">
        ধন্যবাদ। আমাদের প্রতিনিধি শীঘ্রই ফোন করে অর্ডার কনফার্ম করবেন।
      </p>
      {order && (
        <div className="mt-6 rounded-3xl bg-white p-6 text-left shadow-sm">
          <p className="text-sm text-ink/50">অর্ডার আইডি</p>
          <p className="font-mono font-bold">{order.id}</p>
          <p className="mt-3">{order.customerName} · {order.phone}</p>
          <p className="text-sm">{order.address}, {order.district}</p>
          <p className="text-sm">শিপিং: {SHIPPING[order.shippingType]?.label ?? order.shippingType} ({formatTaka(order.shippingFee)})</p>
          <div className="mt-3 space-y-1 text-sm">
            {order.items.map((item) => (
              <p key={item.productId}>
                {item.name} × {item.quantity}
              </p>
            ))}
          </div>
          <p className="mt-3 text-xl font-extrabold text-leaf">{formatTaka(order.total)}</p>
        </div>
      )}
      <Link to="/" className="mt-8 inline-block rounded-full bg-leaf px-6 py-3 font-bold text-gold">
        হোমে ফিরুন
      </Link>
    </div>
  )
}
