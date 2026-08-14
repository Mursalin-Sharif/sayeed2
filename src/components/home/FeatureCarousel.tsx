import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Leaf, PhoneCall, ShieldCheck, Truck, type LucideIcon } from 'lucide-react'
import { SITE } from '@/lib/seed'

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Truck, title: 'কুরিয়ার ও বাস ডেলিভারি', text: 'সারা বাংলাদেশে পৌঁছে যায়' },
  { icon: ShieldCheck, title: 'জাতের গ্যারান্টি', text: 'প্রতিটি চারায় শতভাগ নিশ্চয়তা' },
  { icon: Leaf, title: 'দেশি-বিদেশি চারা', text: 'ফল ও সবজির চারা একসাথে' },
  { icon: PhoneCall, title: 'WhatsApp / Imo', text: SITE.phone },
]

function FeatureCard({ icon: Icon, title, text }: (typeof FEATURES)[number]) {
  return (
    <div className="flex h-full flex-col items-center rounded-3xl bg-white p-5 text-center shadow-sm">
      <Icon className="mb-3 text-leaf-mid" />
      <p className="font-bold text-leaf">{title}</p>
      <p className="text-sm text-ink/70">{text}</p>
    </div>
  )
}

export function FeatureCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const pauseRef = useRef(false)
  const [index, setIndex] = useState(0)

  const goTo = (next: number) => {
    const el = scrollerRef.current
    const card = el?.children[next] as HTMLElement | undefined
    if (el && card) el.scrollTo({ left: card.offsetLeft, behavior: 'smooth' })
    setIndex(next)
  }

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    const onScroll = () => {
      const cards = [...el.children] as HTMLElement[]
      let best = 0
      let bestDist = Infinity
      cards.forEach((card, i) => {
        const dist = Math.abs(card.offsetLeft - el.scrollLeft)
        if (dist < bestDist) {
          bestDist = dist
          best = i
        }
      })
      setIndex(best)
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (pauseRef.current) return
      const next = (index + 1) % FEATURES.length
      goTo(next)
    }, 4000)
    return () => window.clearInterval(timer)
  }, [index])

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="relative lg:hidden">
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onPointerDown={() => {
            pauseRef.current = true
          }}
        >
          {FEATURES.map((item) => (
            <article
              key={item.title}
              className="w-[82%] shrink-0 snap-start sm:w-[48%] md:w-[46%]"
            >
              <FeatureCard {...item} />
            </article>
          ))}
        </div>

        <button
          type="button"
          className="absolute left-0 top-1/2 z-10 inline-flex size-8 -translate-x-1 -translate-y-1/2 items-center justify-center rounded-full bg-leaf text-white shadow sm:size-9"
          onClick={() => {
            pauseRef.current = true
            goTo((index - 1 + FEATURES.length) % FEATURES.length)
          }}
          aria-label="আগের তথ্য"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          className="absolute right-0 top-1/2 z-10 inline-flex size-8 translate-x-1 -translate-y-1/2 items-center justify-center rounded-full bg-leaf text-white shadow sm:size-9"
          onClick={() => {
            pauseRef.current = true
            goTo((index + 1) % FEATURES.length)
          }}
          aria-label="পরের তথ্য"
        >
          <ChevronRight className="size-4" />
        </button>

        <div className="mt-4 flex justify-center gap-1.5">
          {FEATURES.map((item, i) => (
            <button
              key={item.title}
              type="button"
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-gold' : 'w-1.5 bg-leaf/25'}`}
              onClick={() => {
                pauseRef.current = true
                goTo(i)
              }}
              aria-label={item.title}
            />
          ))}
        </div>
      </div>

      <div className="hidden gap-4 lg:grid lg:grid-cols-4">
        {FEATURES.map((item) => (
          <FeatureCard key={item.title} {...item} />
        ))}
      </div>
    </section>
  )
}
