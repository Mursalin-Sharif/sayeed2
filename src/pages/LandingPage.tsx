import { CheckoutForm } from '@/components/order/CheckoutForm'
import { useStore } from '@/context/StoreContext'
import { SITE, normalizeLanding } from '@/lib/seed'
import type { MouseEvent } from 'react'

function youtubeId(url: string) {
  const embed = url.match(/embed\/([a-zA-Z0-9_-]+)/)
  if (embed) return embed[1]
  const watch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/)
  if (watch) return watch[1]
  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
  if (short) return short[1]
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url
  return null
}

function scrollToOrder(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault()
  document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function LandingPage() {
  const { landing, media, products } = useStore()
  const content = normalizeLanding(landing)
  const offer =
    products.find((item) => item.id === content.offerProductId) ??
    products.find((item) => item.id === 'prod_offer_pack') ??
    products[0]
  const gallery = (media ?? []).filter((item) => item.active).sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="bg-white text-center">
      <section className="bg-leaf px-4 py-14 text-white">
        <h1 className="mx-auto max-w-4xl font-display text-3xl leading-snug md:text-5xl">{content.heroTitle}</h1>
        <p className="mx-auto mt-4 max-w-3xl text-gold">{content.heroSubtitle}</p>
        <div className="mx-auto mt-8 max-w-3xl rounded-2xl bg-white px-6 py-4 text-leaf">
          <h2 className="text-xl font-extrabold md:text-2xl">{content.packageTitle}</h2>
        </div>
        <ol className="mx-auto mt-8 max-w-xl list-none space-y-2 text-xl font-bold text-gold">
          {content.packageItems.map((item, i) => (
            <li key={`${item}-${i}`}>
              {i + 1}। {item}
            </li>
          ))}
        </ol>
        <a
          href="#order-form"
          onClick={scrollToOrder}
          className="mt-10 inline-block rounded-md bg-gold px-10 py-4 text-2xl font-extrabold text-black shadow-lg"
        >
          অর্ডার করুন
        </a>
      </section>

      <section className="relative overflow-hidden bg-[#e8f5ed] px-4 py-8 text-center">
        <p className="mx-auto max-w-3xl text-lg font-extrabold leading-snug text-[#e44b1c] md:text-2xl">
          ওয়েবসাইটে অর্ডার করতে সমস্যা হলে বা অর্ডার করতে না পারলে
        </p>
        <p className="mt-2 text-lg font-extrabold text-[#e44b1c] md:text-2xl">প্রয়োজনে কল করুন-</p>
        <p className="mt-2 space-y-1 text-2xl font-extrabold text-[#e44b1c] md:text-3xl">
          <a href={`tel:${SITE.phone2}`} className="block">
            {SITE.phone2}
          </a>
          <a href={`tel:${SITE.phone}`} className="block">
            {SITE.phone}
          </a>
        </p>
        <span
          aria-hidden
          className="pointer-events-none absolute -right-8 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full border-[14px] border-[#e44b1c] md:h-36 md:w-36"
        />
      </section>

      <section className="px-4 py-12">
        <h2 className="mx-auto mb-6 max-w-4xl rounded-xl bg-leaf py-3 text-xl font-bold text-gold md:text-2xl">
          {content.storyTitle}
        </h2>
        <p className="mx-auto max-w-3xl leading-relaxed">{content.storyBody}</p>
        <div className="mx-auto mt-10 flex max-w-5xl flex-wrap justify-center gap-4">
          {gallery.map((item) => (
            <figure key={item.id} className="w-full max-w-sm overflow-hidden rounded-xl border-4 border-gold bg-leaf-deep sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.7rem)]">
              {item.type === 'video' ? (
                <div className="aspect-video">
                  {youtubeId(item.url) ? (
                    <iframe
                      className="size-full"
                      src={`https://www.youtube.com/embed/${youtubeId(item.url)}`}
                      title={item.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video src={item.url} controls className="size-full object-cover" />
                  )}
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={item.title}
                  className="aspect-square w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = '/images/fruits.jpg'
                  }}
                />
              )}
              {(item.title || item.caption) && (
                <figcaption className="bg-leaf px-3 py-2 text-center text-sm text-gold">
                  <p className="font-bold">{item.title}</p>
                  {item.caption ? <p className="text-cream/80">{item.caption}</p> : null}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </section>

      <section className="bg-leaf px-4 py-12 text-white">
        <h2 className="text-2xl font-extrabold text-gold">{content.whyTitle}</h2>
        <ul className="mx-auto mt-6 max-w-2xl space-y-3 text-lg">
          {content.whyItems.map((item, i) => (
            <li key={`${item}-${i}`} className="rounded-xl bg-white/10 px-4 py-3">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-gold px-4 py-10">
        <h2 className="text-2xl font-extrabold text-leaf-deep">
          {content.paymentTitle} {content.paymentNumber}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl font-semibold">{content.paymentNote}</p>
        <p className="mt-1 text-sm">
          হটলাইন: {SITE.phone2} · {SITE.phone}
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-3xl font-bold text-leaf">অর্ডার করুন</h2>
        {offer ? (
          <CheckoutForm
            alignCenter
            catalog={products}
            products={[{ product: offer, quantity: 1 }]}
          />
        ) : (
          <p>অফার পণ্য পাওয়া যায়নি। হোম পেজ থেকে পণ্য বেছে নিন।</p>
        )}
      </section>
    </div>
  )
}
