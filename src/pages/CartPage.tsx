import { Link } from 'react-router-dom'
import { CheckoutForm } from '@/components/order/CheckoutForm'
import { useCart } from '@/context/CartContext'
import { useStore } from '@/context/StoreContext'
import { formatTaka } from '@/lib/utils'

export function CartPage() {
  const { products } = useStore()
  const { lines, setQty, remove, clear } = useCart()
  const rows = lines(products)
  const subtotal = rows.reduce((sum, row) => sum + row.product.price * row.quantity, 0)

  if (!rows.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-display text-4xl text-leaf">কার্ট খালি</h1>
        <p className="mt-3 text-ink/70">পণ্য যোগ করে আবার আসুন।</p>
        <Link to="/" className="mt-6 inline-block rounded-full bg-leaf px-6 py-3 font-bold text-gold">
          কেনাকাটা করুন
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display mb-8 text-4xl text-leaf">আপনার কার্ট</h1>
      <div className="mb-10 overflow-hidden rounded-3xl bg-white shadow-sm">
        {rows.map((row) => (
          <div key={row.product.id} className="flex flex-wrap items-center gap-4 border-b border-leaf/10 p-4">
            <img src={row.product.image} alt="" className="size-20 rounded-2xl object-cover" onError={(e) => { e.currentTarget.src = '/images/fruits.jpg' }} />
            <div className="min-w-40 flex-1">
              <Link to={`/product/${row.product.id}`} className="font-bold text-leaf">
                {row.product.name}
              </Link>
              <p className="text-sm">{formatTaka(row.product.price)}</p>
            </div>
            <input
              type="number"
              min={1}
              value={row.quantity}
              onChange={(e) => setQty(row.product.id, Number(e.target.value))}
              className="w-20 rounded-xl border px-2 py-2"
            />
            <p className="w-24 font-bold">{formatTaka(row.product.price * row.quantity)}</p>
            <button type="button" className="text-sm text-red-600" onClick={() => remove(row.product.id)}>
              মুছুন
            </button>
          </div>
        ))}
        <div className="flex justify-between p-4 font-bold">
          <span>সাবটোটাল</span>
          <span>{formatTaka(subtotal)}</span>
        </div>
      </div>
      <h2 className="mb-6 font-display text-3xl text-leaf">অর্ডার করুন</h2>
      <CheckoutForm products={rows} lockItems onOrdered={clear} />
    </div>
  )
}
