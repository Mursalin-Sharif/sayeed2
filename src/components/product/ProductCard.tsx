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
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-leaf/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[5/4] overflow-hidden bg-leaf-light sm:aspect-[4/3]">
        <SafeImage
          src={product.image}
          alt={product.name}
          className="size-full object-cover transition duration-500 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-leaf-deep sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">
            -{discount}%
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-2 py-1.5 text-center sm:p-4">
        <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-leaf-mid sm:text-xs">
          {product.category}
        </p>
        <h3 className="mt-0.5 line-clamp-1 text-sm font-bold leading-snug text-leaf sm:mt-1 sm:line-clamp-2 sm:min-h-[2.6em] sm:text-lg">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-1 hidden text-sm text-ink/70 lg:block">{product.headline}</p>
        <div className="mt-auto flex flex-wrap items-end justify-center gap-1 pt-1 sm:gap-2 sm:pt-2">
          <span className="text-base font-extrabold text-leaf-mid sm:text-xl">{formatTaka(product.price)}</span>
          {product.comparePrice ? (
            <span className="text-xs text-ink/40 line-through sm:text-sm">{formatTaka(product.comparePrice)}</span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
