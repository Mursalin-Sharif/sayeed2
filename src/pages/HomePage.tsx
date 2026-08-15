import { Link } from 'react-router-dom'
import { FeatureCarousel } from '@/components/home/FeatureCarousel'
import { HeroCarousel } from '@/components/home/HeroCarousel'
import { ProductCard } from '@/components/product/ProductCard'
import { useStore } from '@/context/StoreContext'
import { SITE } from '@/lib/seed'

export function HomePage() {
  const { products } = useStore()

  return (
    <div>
      <HeroCarousel />
      <FeatureCarousel />

      <section className="px-4">
        <Link
          to="/offer"
          className="mx-auto flex max-w-6xl flex-col items-center gap-1.5 overflow-hidden rounded-2xl bg-leaf px-4 py-3 text-center text-white lg:gap-3 lg:rounded-3xl lg:px-8 lg:py-5"
        >
          <div>
            <p className="text-xs text-gold lg:text-sm">{SITE.slogan}</p>
            <h2 className="font-display text-base leading-snug lg:text-2xl">হাইব্রিড পেঁপে চারা · শতভাগ জাতের গ্যারান্টি</h2>
          </div>
          <span className="rounded-full bg-gold px-4 py-1.5 text-xs font-bold text-leaf-deep lg:px-6 lg:py-2 lg:text-sm">
            অফার পেজ দেখুন
          </span>
        </Link>
      </section>

      <section id="products" className="mx-auto max-w-6xl px-3 py-4 lg:px-4 lg:py-8">
        <div className="grid grid-cols-2 items-stretch gap-2.5 sm:gap-4 lg:grid-cols-3 lg:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}
