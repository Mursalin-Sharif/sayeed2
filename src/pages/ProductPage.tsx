import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckoutForm } from '@/components/order/CheckoutForm'
import { SafeImage } from '@/components/ui/SafeImage'
import { useCart } from '@/context/CartContext'
import { useStore } from '@/context/StoreContext'
import { trackAddToCart, trackViewContent } from '@/lib/metaPixel'
import { formatTaka } from '@/lib/utils'

export function ProductPage() {
  const { id } = useParams()
  const { products } = useStore()
  const { add } = useCart()
  const product = products.find((item) => item.id === id)
  const [active, setActive] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!product) return
    trackViewContent({
      id: product.id,
      name: product.name,
      value: product.price,
      category: product.category,
    })
  }, [product])

  if (!product) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-xl font-bold">পণ্য পাওয়া যায়নি</p>
        <Link to="/" className="mt-4 inline-block text-leaf-mid underline">
          হোমে ফিরুন
        </Link>
      </div>
    )
  }

  const gallery = product.gallery.length ? product.gallery : [product.image]

  function goOrder() {
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <SafeImage
            src={gallery[active] ?? product.image}
            alt={product.name}
            className="aspect-square w-full rounded-3xl shadow"
          />
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {gallery.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`size-20 overflow-hidden rounded-2xl border-2 ${i === active ? 'border-gold' : 'border-transparent'}`}
                >
                  <SafeImage src={src} alt="" className="size-full" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-leaf-mid">{product.category}</p>
          <h1 className="font-display mt-1 text-4xl text-leaf">{product.name}</h1>
          <p className="mt-3 text-lg text-ink/80">{product.headline}</p>
          <div className="mt-5 flex items-end gap-3">
            <span className="text-3xl font-extrabold text-leaf-mid">{formatTaka(product.price)}</span>
            {product.comparePrice ? (
              <span className="text-lg text-ink/40 line-through">{formatTaka(product.comparePrice)}</span>
            ) : null}
          </div>
          <p className="mt-6 leading-relaxed text-ink/80">{product.description}</p>
          <p className="mt-3 text-sm">স্টক: {product.stock}টি</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              className="w-24 rounded-xl border border-leaf/20 px-3 py-3"
            />
            <button
              type="button"
              onClick={() => {
                add(product.id, qty)
                trackAddToCart({
                  id: product.id,
                  name: product.name,
                  value: product.price,
                  quantity: qty,
                })
                setAdded(true)
              }}
              className="rounded-full border-2 border-leaf px-6 py-3 font-bold text-leaf"
            >
              {added ? 'কার্টে যোগ হয়েছে' : 'কার্টে যোগ করুন'}
            </button>
            <button
              type="button"
              onClick={goOrder}
              className="rounded-full bg-gold px-8 py-3 text-lg font-extrabold text-leaf-deep shadow"
            >
              অর্ডার করুন
            </button>
          </div>
        </div>
      </div>

      <div className="mt-14">
        <h2 className="mb-6 font-display text-3xl text-leaf">অর্ডার সম্পূর্ণ করুন</h2>
        <CheckoutForm products={[{ product, quantity: qty }]} />
      </div>
    </div>
  )
}
