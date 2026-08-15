const ATTR_KEY = 'js-agro-shop-attribution'
const ENV_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID?.trim() ?? ''
let runtimePixelId = ENV_PIXEL_ID

export type Attribution = {
  source: string
  medium: string
  campaign: string
  content: string
  fbclid: string
  landing: string
}

type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[] }

declare global {
  interface Window {
    fbq?: Fbq
    _fbq?: Fbq
  }
}

const emptyAttr: Attribution = {
  source: '',
  medium: '',
  campaign: '',
  content: '',
  fbclid: '',
  landing: '',
}

export function readAttribution(): Attribution {
  try {
    const raw = sessionStorage.getItem(ATTR_KEY)
    return raw ? { ...emptyAttr, ...(JSON.parse(raw) as Attribution) } : { ...emptyAttr }
  } catch {
    return { ...emptyAttr }
  }
}

export function captureAttribution(search: string, pathname: string) {
  const params = new URLSearchParams(search)
  const prev = readAttribution()
  const utmSource = params.get('utm_source')?.trim() ?? ''
  const utmMedium = params.get('utm_medium')?.trim() ?? ''
  const utmCampaign = params.get('utm_campaign')?.trim() ?? ''
  const utmContent = params.get('utm_content')?.trim() ?? ''
  const fbclid = params.get('fbclid')?.trim() ?? ''
  const isLanding = pathname === '/landing' || pathname === '/offer'
  const next: Attribution = {
    source: utmSource || (fbclid ? 'facebook' : isLanding && !prev.source ? 'facebook' : prev.source),
    medium: utmMedium || (fbclid ? 'paid' : prev.medium),
    campaign: utmCampaign || (isLanding && !prev.campaign ? 'landing' : prev.campaign),
    content: utmContent || prev.content,
    fbclid: fbclid || prev.fbclid,
    landing: isLanding ? pathname : prev.landing,
  }
  sessionStorage.setItem(ATTR_KEY, JSON.stringify(next))
  return next
}

export function attributionLabel(source?: string, campaign?: string) {
  const src = source?.trim()
  const camp = campaign?.trim()
  if (!src && !camp) return 'Direct'
  return [src, camp].filter(Boolean).join(' / ')
}

function fbq(...args: unknown[]) {
  if (!getMetaPixelId() || typeof window === 'undefined' || !window.fbq) return
  window.fbq(...args)
}

export function hasMetaPixel() {
  return Boolean(getMetaPixelId())
}

export function getMetaPixelId() {
  return runtimePixelId || ENV_PIXEL_ID
}

export function setMetaPixelId(id: string) {
  runtimePixelId = id.trim() || ENV_PIXEL_ID
}

let initedId = ''

export function initMetaPixel(id = getMetaPixelId()) {
  if (!id || typeof window === 'undefined') return
  setMetaPixelId(id)
  if (!window.fbq) {
    const n: Fbq = function (...args: unknown[]) {
      if (n.callMethod) n.callMethod(...args)
      else (n.queue = n.queue ?? []).push(args)
    } as Fbq
    window.fbq = n
    if (!window._fbq) window._fbq = n
    n.queue = []
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(script)
  }
  if (initedId === id) return
  window.fbq('init', id)
  initedId = id
}

const onceKeys = new Set<string>()

export function trackOnce(key: string, fire: () => void) {
  if (onceKeys.has(key)) return
  onceKeys.add(key)
  fire()
}

export function trackPageView() {
  fbq('track', 'PageView')
}

export function trackViewContent(input: { id: string; name: string; value: number; category?: string }) {
  fbq('track', 'ViewContent', {
    content_ids: [input.id],
    content_name: input.name,
    content_type: 'product',
    content_category: input.category ?? '',
    value: input.value,
    currency: 'BDT',
  })
}

export function trackAddToCart(input: { id: string; name: string; value: number; quantity: number }) {
  fbq('track', 'AddToCart', {
    content_ids: [input.id],
    content_name: input.name,
    content_type: 'product',
    value: input.value * input.quantity,
    currency: 'BDT',
    contents: [{ id: input.id, quantity: input.quantity, item_price: input.value }],
  })
}

export function trackInitiateCheckout(input: { items: { id: string; name: string; price: number; quantity: number }[]; value: number }) {
  fbq('track', 'InitiateCheckout', {
    content_ids: input.items.map((item) => item.id),
    content_type: 'product',
    value: input.value,
    currency: 'BDT',
    num_items: input.items.reduce((sum, item) => sum + item.quantity, 0),
    contents: input.items.map((item) => ({ id: item.id, quantity: item.quantity, item_price: item.price })),
  })
}

export function trackPurchase(input: {
  id: string
  value: number
  items: { id: string; name: string; price: number; quantity: number }[]
}) {
  fbq('track', 'Purchase', {
    content_ids: input.items.map((item) => item.id),
    content_type: 'product',
    value: input.value,
    currency: 'BDT',
    contents: input.items.map((item) => ({ id: item.id, quantity: item.quantity, item_price: item.price })),
  }, { eventID: input.id })
}
