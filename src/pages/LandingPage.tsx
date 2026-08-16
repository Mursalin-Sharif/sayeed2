import { CheckoutForm } from '@/components/order/CheckoutForm'
import { SafeImage } from '@/components/ui/SafeImage'
import { useStore } from '@/context/StoreContext'
import { trackAddToCart, trackInitiateCheckout, trackOnce, trackViewContent } from '@/lib/metaPixel'
import { SITE, normalizeLanding } from '@/lib/seed'
import { formatTaka } from '@/lib/utils'
import { useEffect, useState, type MouseEvent } from 'react'
import { useLocation } from 'react-router-dom'

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

function trackLandingCheckout(
  pathname: string,
  offer: { id: string; name: string; price: number } | undefined,
) {
  if (!offer) return
  trackOnce(`atc:${pathname}:${offer.id}`, () =>
    trackAddToCart({ id: offer.id, name: offer.name, value: offer.price, quantity: 1 }),
  )
  trackOnce(`ico:${pathname}`, () =>
    trackInitiateCheckout({
      value: offer.price,
      items: [{ id: offer.id, name: offer.name, price: offer.price, quantity: 1 }],
    }),
  )
}

export function LandingPage() {
  const { landing, media, products } = useStore()
  const { pathname } = useLocation()
  const content = normalizeLanding(landing)
  const offer =
    products.find((item) => item.id === content.offerProductId) ??
    products.find((item) => item.id === 'prod_offer_pack') ??
    products[0]
  const photos = offer ? (offer.gallery.length ? offer.gallery : [offer.image]) : []
  const videos = (media ?? []).filter((item) => item.active && item.type === 'video').sort((a, b) => a.sortOrder - b.sortOrder)
  const features = content.packageItems.filter(Boolean)
  const extras = content.whyItems.filter(Boolean)
  const [active, setActive] = useState(0)

  useEffect(() => {
    setActive(0)
  }, [offer?.id])

  useEffect(() => {
    if (!offer) return
    trackViewContent({
      id: offer.id,
      name: offer.name,
      value: offer.price,
      category: offer.category,
    })
  }, [offer])

  if (!offer) {
    return (
      <div className="bg-cream px-4 py-20 text-center">
        <p>অফার পণ্য পাওয়া যায়নি। হোম পেজ থেকে পণ্য বেছে নিন।</p>
      </div>
    )
  }

  return (
    <div className="bg-white text-center">
      <section className="bg-leaf px-4 py-14 text-white">
        <p className="text-sm font-semibold text-gold">{offer.category}</p>
        <h1 className="mx-auto mt-2 max-w-4xl font-display text-3xl leading-snug md:text-5xl">{offer.name}</h1>
        <p className="mx-auto mt-4 max-w-3xl text-gold">{offer.headline}</p>
        <div className="mt-6 flex items-end justify-center gap-3">
          <span className="text-3xl font-extrabold text-gold md:text-4xl">{formatTaka(offer.price)}</span>
          {offer.comparePrice ? (
            <span className="text-lg text-white/50 line-through">{formatTaka(offer.comparePrice)}</span>
          ) : null}
        </div>
        <a
          href="#order-form"
          onClick={(event) => {
            scrollToOrder(event)
            trackLandingCheckout(pathname, offer)
          }}
          className="mt-10 inline-block rounded-md bg-gold px-10 py-4 text-2xl font-extrabold text-black shadow-lg"
        >
          অর্ডার করুন
        </a>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-xl">
          <SafeImage
            src={photos[active] ?? offer.image}
            alt={offer.name}
            className="aspect-square w-full rounded-3xl shadow"
          />
          {photos.length > 1 ? (
            <div className="mt-3 flex justify-center gap-2 overflow-x-auto">
              {photos.map((src, i) => (
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
          ) : null}
        </div>

        <h2 className="mx-auto mt-10 mb-6 max-w-4xl rounded-xl bg-leaf py-3 text-xl font-bold text-gold md:text-2xl">
          {content.storyTitle || offer.name}
        </h2>
        <p className="mx-auto max-w-3xl leading-relaxed">{offer.description}</p>
        {content.storyBody ? <p className="mx-auto mt-4 max-w-3xl leading-relaxed">{content.storyBody}</p> : null}

        {videos.length ? (
          <div className="mx-auto mt-10 flex max-w-5xl flex-wrap justify-center gap-4">
            {videos.map((item) => (
              <figure key={item.id} className="w-full max-w-sm overflow-hidden rounded-xl border-4 border-gold bg-leaf-deep sm:w-[calc(50%-0.5rem)]">
                <div className="aspect-video">
                  {youtubeId(item.url) ? (
                    <iframe
                      className="size-full"
                      src={`https://www.youtube.com/embed/${youtubeId(item.url)}`}
                      title={item.title || offer.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video src={item.url} controls className="size-full object-cover" />
                  )}
                </div>
                {(item.title || item.caption) && (
                  <figcaption className="bg-leaf px-3 py-2 text-center text-sm text-gold">
                    <p className="font-bold">{item.title}</p>
                    {item.caption ? <p className="text-cream/80">{item.caption}</p> : null}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        ) : null}
      </section>

      {features.length ? (
        <section className="bg-leaf px-4 py-12 text-white">
          <h2 className="text-2xl font-extrabold text-gold">{content.packageTitle || 'বৈশিষ্ট্য'}</h2>
          <ol className="mx-auto mt-6 max-w-xl list-none space-y-2 text-lg font-bold text-gold">
            {features.map((item, i) => (
              <li key={`${item}-${i}`} className="rounded-xl bg-white/10 px-4 py-3">
                {i + 1}। {item}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {extras.length ? (
        <section className="px-4 py-12">
          <h2 className="text-2xl font-extrabold text-leaf">{content.whyTitle || 'কেন এই পণ্য?'}</h2>
          <ul className="mx-auto mt-6 max-w-2xl space-y-3 text-lg">
            {extras.map((item, i) => (
              <li key={`${item}-${i}`} className="rounded-xl bg-cream px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="bg-gold px-4 py-10">
        <p className="mx-auto max-w-3xl text-lg font-extrabold leading-snug text-leaf-deep md:text-2xl">
          ওয়েবসাইটে অর্ডার করতে সমস্যা হলে বা অর্ডার করতে না পারলে
        </p>
        <p className="mt-3 text-lg font-extrabold text-leaf-deep md:text-2xl">প্রয়োজনে কল করুন-</p>
        <p className="mt-3 space-y-1 text-2xl font-extrabold text-leaf-deep md:text-3xl">
          <a href={`tel:${SITE.phone2}`} className="block">
            {SITE.phone2}
          </a>
          <a href={`tel:${SITE.phone}`} className="block">
            {SITE.phone}
          </a>
        </p>
      </section>

      <section className="bg-cream px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-6 text-2xl font-bold leading-snug text-leaf sm:text-3xl">
            আপনার নাম, ঠিকানা ও মোবাইল নম্বর দিয়ে অর্ডারটি সম্পন্ন করুন
          </h2>
          <CheckoutForm alignCenter products={[{ product: offer, quantity: 1 }]} />
        </div>
      </section>
    </div>
  )
}
