import type { Customer, Order, StoreSnapshot } from './types'
import { createSeedSnapshot } from './seed'

const KEY = 'js-agro-shop-store-v1'

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
      landing: parsed.landing ?? seed.landing,
      customers: [],
      messages: parsed.messages ?? seed.messages,
    }
    snapshot.customers = customersFromOrders(snapshot.orders)
    return snapshot
  } catch {
    return createSeedSnapshot()
  }
}

export function saveSnapshot(snapshot: StoreSnapshot) {
  const next = {
    ...snapshot,
    messages: snapshot.messages ?? [],
    customers: customersFromOrders(snapshot.orders),
  }
  localStorage.setItem(KEY, JSON.stringify(next))
  return next
}

export function resetSnapshot() {
  localStorage.removeItem(KEY)
  return loadSnapshot()
}
