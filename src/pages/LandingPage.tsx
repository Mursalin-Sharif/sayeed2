import { CheckoutForm } from '@/components/order/CheckoutForm'
import { SafeImage } from '@/components/ui/SafeImage'
import { useStore } from '@/context/StoreContext'
import { trackAddToCart, trackInitiateCheckout, trackOnce, trackViewContent } from '@/lib/metaPixel'
import { SITE, normalizeLanding } from '@/lib/seed'
import { useEffect, type MouseEvent } from 'react'
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

const NUMBER_PREFIX = /^(\d+|[০-৯]+)[.\।)]\s*(.*)$/

type PackageLine =
  | { kind: 'heading'; text: string }
  | { kind: 'item'; number: string; title: string; body: string }

function parsePackageLine(line: string, autoNumber?: number): PackageLine {
  const match = line.match(NUMBER_PREFIX)
  const rest = match ? match[2] : line
  const number = match?.[1] ?? (autoNumber != null ? String(autoNumber) : '')
  if (!number) return { kind: 'heading', text: line }

  const colon = rest.split(/[:：]\s*/)
  if (colon.length >= 2 && colon[0].trim()) {
    return { kind: 'item', number, title: colon[0].trim(), body: colon.slice(1).join(': ').trim() }
  }
  return { kind: 'item', number, title: rest.trim(), body: '' }
}

function parsePackageItems(items: string[]): PackageLine[] {
  const hasManualNumbers = items.some((item) => NUMBER_PREFIX.test(item))
  return items.map((item, index) => parsePackageLine(item, hasManualNumbers ? undefined : index + 1))
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

function OrderCta({
  pathname,
  offer,
  className = 'mt-8 inline-block rounded-md bg-gold px-10 py-4 text-2xl font-extrabold text-black shadow-lg',
}: {
  pathname: string
  offer: { id: string; name: string; price: number } | undefined
  className?: string
}) {
  return (
    <a
      href="#order-form"
      onClick={(event) => {
        scrollToOrder(event)
        trackLandingCheckout(pathname, offer)
      }}
      className={className}
    >
      অর্ডার করুন
    </a>
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
  const gallery = (media ?? []).filter((item) => item.active).sort((a, b) => a.sortOrder - b.sortOrder)

  useEffect(() => {
    if (!offer) return
    trackViewContent({
      id: offer.id,
      name: offer.name,
      value: offer.price,
      category: offer.category,
    })
  }, [offer])

  return (
    <div className="bg-white text-center">
      <section className="bg-leaf px-4 py-14 text-white">
        <h1 className="mx-auto max-w-4xl font-display text-3xl leading-snug md:text-5xl">{content.heroTitle}</h1>
        <p className="mx-auto mt-4 max-w-3xl text-gold">{content.heroSubtitle}</p>
        <OrderCta pathname={pathname} offer={offer} />
        <div className="mx-auto mt-8 max-w-3xl rounded-2xl bg-white px-6 py-5 text-leaf">
          <h2 className="text-xl font-extrabold md:text-2xl">{content.packageTitle}</h2>
          <OrderCta
            pathname={pathname}
            offer={offer}
            className="mt-4 inline-block rounded-md bg-gold px-8 py-3 text-xl font-extrabold text-black shadow-lg"
          />
        </div>
        <div className="mx-auto mt-8 max-w-2xl space-y-3">
          {parsePackageItems(content.packageItems).map((item, i) =>
            item.kind === 'heading' ? (
              <p
                key={`heading-${i}`}
                className={`text-center font-extrabold leading-snug text-gold ${i === 0 ? 'text-2xl md:text-3xl' : 'text-lg text-cream md:text-xl'}`}
              >
                {item.text}
              </p>
            ) : (
              <div key={`item-${i}`} className="flex gap-3 rounded-2xl bg-white/10 px-4 py-3 text-left">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-extrabold text-leaf-deep">
                  {item.number}
                </span>
                <div>
                  <p className="font-extrabold leading-snug text-gold">{item.title}</p>
                  {item.body ? (
                    <p className="mt-1 text-sm font-medium leading-relaxed text-cream/90">{item.body}</p>
                  ) : null}
                </div>
              </div>
            ),
          )}
        </div>
        <OrderCta pathname={pathname} offer={offer} className="mt-10 inline-block rounded-md bg-gold px-10 py-4 text-2xl font-extrabold text-black shadow-lg" />
      </section>

      <section className="px-4 py-12">
        <h2 className="mx-auto mb-6 max-w-4xl rounded-xl bg-leaf py-3 text-xl font-bold text-gold md:text-2xl">
          {content.storyTitle}
        </h2>
        <p className="mx-auto max-w-3xl leading-relaxed">{content.storyBody}</p>
        <div className="mx-auto mt-10 flex max-w-5xl flex-wrap justify-center gap-4">
          {gallery.map((item) => (
            <figure
              key={item.id}
              className="w-full max-w-sm overflow-hidden rounded-xl border-4 border-gold bg-leaf-deep sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.7rem)]"
            >
              {item.type === 'video' ? (
                <>
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
                  <a
                    href="#order-form"
                    onClick={(event) => {
                      scrollToOrder(event)
                      trackLandingCheckout(pathname, offer)
                    }}
                    className="block bg-gold py-3 text-lg font-extrabold text-black"
                  >
                    অর্ডার করুন
                  </a>
                </>
              ) : (
                <a
                  href="#order-form"
                  onClick={(event) => {
                    scrollToOrder(event)
                    trackLandingCheckout(pathname, offer)
                  }}
                  className="block"
                >
                  <SafeImage src={item.url} alt={item.title} className="aspect-square w-full object-cover" />
                  <span className="block bg-gold py-3 text-lg font-extrabold text-black">
                    অর্ডার করুন
                  </span>
                </a>
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
        <OrderCta pathname={pathname} offer={offer} className="mt-10 inline-block rounded-md bg-gold px-10 py-4 text-2xl font-extrabold text-black shadow-lg" />
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
        <OrderCta pathname={pathname} offer={offer} className="mt-10 inline-block rounded-md bg-gold px-10 py-4 text-2xl font-extrabold text-black shadow-lg" />
      </section>

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
          <h2 className="mb-6 text-3xl font-bold text-leaf">অর্ডার করুন</h2>
          {offer ? (
            <CheckoutForm
              alignCenter
              products={[{ product: offer, quantity: 1 }]}
            />
          ) : (
            <p>অফার পণ্য পাওয়া যায়নি। হোম পেজ থেকে পণ্য বেছে নিন।</p>
          )}
        </div>
      </section>
    </div>
  )
}
