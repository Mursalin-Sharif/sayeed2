import { Link } from 'react-router-dom'
import type { Product } from '@/lib/types'
import { formatTaka } from '@/lib/utils'
import { SafeImage } from '@/components/ui/SafeImage'

export function ProductCard({ product }: { product: Product }) {
  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round((1 - product.price / product.comparePrice) * 100)
      : 0

  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-leaf/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-md sm:rounded-2xl"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-leaf-light">
        <SafeImage
          src={product.image}
          alt={product.name}
          className="size-full object-cover transition duration-500 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-gold px-1.5 py-0.5 text-[9px] font-extrabold text-leaf-deep sm:left-2.5 sm:top-2.5 sm:px-2 sm:text-[10px]">
            -{discount}%
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-2 py-1.5 text-center sm:px-3 sm:py-2">
        <p className="truncate text-[9px] font-semibold text-leaf-mid sm:text-[11px]">{product.category}</p>
        <h3 className="mt-0.5 line-clamp-1 text-xs font-bold leading-snug text-leaf sm:text-sm">{product.name}</h3>
        <div className="mt-1 flex flex-wrap items-baseline justify-center gap-1">
          <span className="text-sm font-extrabold text-leaf-mid sm:text-base">{formatTaka(product.price)}</span>
          {product.comparePrice ? (
            <span className="text-[10px] text-ink/35 line-through">{formatTaka(product.comparePrice)}</span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
