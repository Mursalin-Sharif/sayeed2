import type { Customer, Order, StoreSnapshot } from './types'
import { createSeedSnapshot, normalizeLanding } from './seed'

const KEY = 'js-agro-shop-store-v5'

export function customersFromOrders(orders: Order[]): Customer[] {
  const map = new Map<string, Customer>()
  for (const order of orders) {
    const existing = map.get(order.phone)
    const spent = order.status === 'cancelled' ? 0 : order.total
    if (!existing) {
      map.set(order.phone, {
        id: `cust_${order.phone}`,
        name: order.customerName,
        phone: order.phone,
        address: order.address,
        district: order.district,
        orderCount: 1,
        totalSpent: spent,
        lastOrderAt: order.createdAt,
      })
      continue
    }
    existing.orderCount += 1
    existing.totalSpent += spent
    if (order.createdAt > existing.lastOrderAt) {
      existing.lastOrderAt = order.createdAt
      existing.name = order.customerName
      existing.address = order.address
      existing.district = order.district
    }
  }
  return [...map.values()].sort((a, b) => b.lastOrderAt.localeCompare(a.lastOrderAt))
}

export function loadSnapshot(): StoreSnapshot {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      const seed = createSeedSnapshot()
      return saveSnapshot(seed)
    }
    const parsed = JSON.parse(raw) as Partial<StoreSnapshot>
    const seed = createSeedSnapshot()
    const snapshot: StoreSnapshot = {
      products: parsed.products?.length ? parsed.products : seed.products,
      orders: parsed.orders ?? seed.orders,
      slides: parsed.slides?.length ? parsed.slides : seed.slides,
      media: parsed.media?.length ? parsed.media : seed.media,
      landing: normalizeLanding(parsed.landing),
      customers: [],
      messages: parsed.messages ?? seed.messages,
    }
    snapshot.customers = customersFromOrders(snapshot.orders)
    snapshot.slides = snapshot.slides.map((slide) => ({
      ...slide,
      subtitle: slide.subtitle.replaceAll('৯.৮ হাজার', '২০ হাজার'),
    }))
    snapshot.landing = normalizeLanding({
      ...snapshot.landing,
      heroSubtitle: snapshot.landing.heroSubtitle.replaceAll('৯.৮ হাজার', '২০ হাজার'),
    })
    return snapshot
  } catch {
    return createSeedSnapshot()
  }
}

export function saveSnapshot(snapshot: StoreSnapshot) {
  const next = {
    ...snapshot,
    landing: normalizeLanding(snapshot.landing),
    messages: snapshot.messages ?? [],
    customers: customersFromOrders(snapshot.orders),
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Keep in-memory changes working even if storage is full.
  }
  return next
}

export function resetSnapshot() {
  localStorage.removeItem(KEY)
  return loadSnapshot()
}

export function onLocalSnapshotChange(callback: () => void) {
  const handler = (event: StorageEvent) => {
    if (event.key === KEY) callback()
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}
