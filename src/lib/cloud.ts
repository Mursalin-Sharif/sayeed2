import type {
  CarouselSlide,
  LandingContent,
  LandingMedia,
  Order,
  Product,
  StoreSnapshot,
} from './types'
import { isSupabaseEnabled, supabase } from './supabase'
import { customersFromOrders } from './localStore'
import { normalizeLanding, seedLanding } from './seed'

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

function asProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    name: String(row.name),
    headline: String(row.headline ?? ''),
    description: String(row.description ?? ''),
    price: Number(row.price),
    comparePrice: row.compare_price == null ? null : Number(row.compare_price),
    image: String(row.image),
    gallery: Array.isArray(row.gallery) ? (row.gallery as string[]) : [],
    category: String(row.category ?? ''),
    stock: Number(row.stock ?? 0),
    featured: Boolean(row.featured),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  }
}

export function asOrder(row: Record<string, unknown>): Order {
  return {
    id: String(row.id),
    items: Array.isArray(row.items) ? (row.items as Order['items']) : [],
    customerName: String(row.customer_name),
    phone: String(row.phone),
    address: String(row.address),
    district: String(row.district),
    shippingType: row.shipping_type === 'upazila' ? 'upazila' : row.shipping_type === 'home' ? 'home' : 'district',
    shippingFee: Number(row.shipping_fee),
    subtotal: Number(row.subtotal),
    total: Number(row.total),
    status: (row.status as Order['status']) ?? 'pending',
    notes: String(row.notes ?? ''),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  }
}

function asSlide(row: Record<string, unknown>): CarouselSlide {
  return {
    id: String(row.id),
    image: String(row.image),
    title: String(row.title ?? ''),
    subtitle: String(row.subtitle ?? ''),
    ctaText: String(row.cta_text ?? ''),
    ctaLink: String(row.cta_link ?? '/'),
    sortOrder: Number(row.sort_order ?? 0),
    active: Boolean(row.active),
  }
}

function asMedia(row: Record<string, unknown>): LandingMedia {
  return {
    id: String(row.id),
    type: row.type === 'video' ? 'video' : 'image',
    url: String(row.url),
    title: String(row.title ?? ''),
    caption: String(row.caption ?? ''),
    sortOrder: Number(row.sort_order ?? 0),
    active: Boolean(row.active),
  }
}

function asLanding(row: Record<string, unknown>): LandingContent {
  return normalizeLanding({
    heroTitle: String(row.hero_title ?? ''),
    heroSubtitle: String(row.hero_subtitle ?? ''),
    packageTitle: String(row.package_title ?? ''),
    packageItems: Array.isArray(row.package_items)
      ? (row.package_items as string[])
      : typeof row.package_items === 'string'
        ? [row.package_items]
        : [],
    storyTitle: String(row.story_title ?? ''),
    storyBody: String(row.story_body ?? ''),
    whyTitle: String(row.why_title ?? ''),
    whyItems: Array.isArray(row.why_items)
      ? (row.why_items as string[])
      : typeof row.why_items === 'string'
        ? [row.why_items]
        : [],
    paymentTitle: String(row.payment_title ?? ''),
    paymentNumber: String(row.payment_number ?? ''),
    paymentNote: String(row.payment_note ?? ''),
    offerProductId: String(row.offer_product_id ?? 'prod_offer_pack'),
  })
}

export async function fetchCloudSnapshot(): Promise<StoreSnapshot | null> {
  if (!isSupabaseEnabled || !supabase) return null
  const [products, orders, slides, media, landing] = await Promise.all([
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
    supabase.from('carousel_slides').select('*').order('sort_order'),
    supabase.from('landing_media').select('*').order('sort_order'),
    supabase.from('landing_content').select('*').eq('id', 1).maybeSingle(),
  ])
  if (products.error || orders.error) return null
  const orderList = (orders.data ?? []).map((row) => asOrder(row as Record<string, unknown>))
  return {
    products: (products.data ?? []).map((row) => asProduct(row as Record<string, unknown>)),
    orders: orderList,
    slides: (slides.data ?? []).map((row) => asSlide(row as Record<string, unknown>)),
    media: (media.data ?? []).map((row) => asMedia(row as Record<string, unknown>)),
    landing: landing.data ? asLanding(landing.data as Record<string, unknown>) : seedLanding,
    customers: customersFromOrders(orderList),
    messages: [],
  }
}

export async function fetchCloudOrders(): Promise<Order[] | null> {
  if (!isSupabaseEnabled || !supabase) return null
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (error) return null
  return (data ?? []).map((row) => asOrder(row as Record<string, unknown>))
}

export function subscribeToOrders(handlers: {
  onInsert: (order: Order) => void
  onUpdate?: (order: Order) => void
  onDelete?: (id: string) => void
}) {
  if (!supabase) return () => {}
  const client = supabase
  const channel = client
    .channel('admin-orders')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'orders' },
      (payload) => {
        handlers.onInsert(asOrder(payload.new as Record<string, unknown>))
      },
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'orders' },
      (payload) => {
        handlers.onUpdate?.(asOrder(payload.new as Record<string, unknown>))
      },
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'orders' },
      (payload) => {
        const id = String((payload.old as { id?: string } | null)?.id ?? '')
        if (id) handlers.onDelete?.(id)
      },
    )
    .subscribe()
  return () => {
    void client.removeChannel(channel)
  }
}

export async function cloudUpsertProduct(product: Product) {
  if (!supabase) return
  const { error } = await supabase.from('products').upsert({
    id: product.id,
    name: product.name,
    headline: product.headline,
    description: product.description,
    price: product.price,
    compare_price: product.comparePrice,
    image: product.image,
    gallery: product.gallery,
    category: product.category,
    stock: product.stock,
    featured: product.featured,
    created_at: product.createdAt,
  })
  fail(error)
}

export async function cloudDeleteProduct(id: string) {
  if (!supabase) return
  const { error } = await supabase.from('products').delete().eq('id', id)
  fail(error)
}

export async function cloudInsertOrder(order: Order) {
  if (!supabase) return
  const { error } = await supabase.from('orders').insert({
    id: order.id,
    items: order.items,
    customer_name: order.customerName,
    phone: order.phone,
    address: order.address,
    district: order.district,
    shipping_type: order.shippingType,
    shipping_fee: order.shippingFee,
    subtotal: order.subtotal,
    total: order.total,
    status: order.status,
    notes: order.notes,
    created_at: order.createdAt,
  })
  fail(error)
}

export async function cloudUpdateOrderStatus(id: string, status: Order['status']) {
  if (!supabase) return
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  fail(error)
}

export async function cloudDeleteOrder(id: string) {
  if (!supabase) return
  const { error } = await supabase.from('orders').delete().eq('id', id)
  fail(error)
}

export async function cloudUpsertSlide(slide: CarouselSlide) {
  if (!supabase) return
  const { error } = await supabase.from('carousel_slides').upsert({
    id: slide.id,
    image: slide.image,
    title: slide.title,
    subtitle: slide.subtitle,
    cta_text: slide.ctaText,
    cta_link: slide.ctaLink,
    sort_order: slide.sortOrder,
    active: slide.active,
  })
  fail(error)
}

export async function cloudDeleteSlide(id: string) {
  if (!supabase) return
  const { error } = await supabase.from('carousel_slides').delete().eq('id', id)
  fail(error)
}

export async function cloudUpsertMedia(item: LandingMedia) {
  if (!supabase) return
  const { error } = await supabase.from('landing_media').upsert({
    id: item.id,
    type: item.type,
    url: item.url,
    title: item.title,
    caption: item.caption,
    sort_order: item.sortOrder,
    active: item.active,
  })
  fail(error)
}

export async function cloudDeleteMedia(id: string) {
  if (!supabase) return
  const { error } = await supabase.from('landing_media').delete().eq('id', id)
  fail(error)
}

export async function cloudSaveLanding(landing: LandingContent) {
  if (!supabase) return
  const { error } = await supabase.from('landing_content').upsert({
    id: 1,
    hero_title: landing.heroTitle,
    hero_subtitle: landing.heroSubtitle,
    package_title: landing.packageTitle,
    package_items: landing.packageItems,
    story_title: landing.storyTitle,
    story_body: landing.storyBody,
    why_title: landing.whyTitle,
    why_items: landing.whyItems,
    payment_title: landing.paymentTitle,
    payment_number: landing.paymentNumber,
    payment_note: landing.paymentNote,
    offer_product_id: landing.offerProductId,
  })
  fail(error)
}

export async function uploadMediaFile(file: File): Promise<string> {
  if (supabase) {
    const path = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const { error } = await supabase.storage.from('media').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('media').getPublicUrl(path)
      return data.publicUrl
    }
  }
  if (file.type.startsWith('image/')) return compressImageFile(file)
  return readAsDataUrl(file)
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

async function compressImageFile(file: File): Promise<string> {
  try {
    const bitmap = await createImageBitmap(file)
    const max = 1400
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      bitmap.close()
      return readAsDataUrl(file)
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    return canvas.toDataURL('image/jpeg', 0.8)
  } catch {
    return readAsDataUrl(file)
  }
}
