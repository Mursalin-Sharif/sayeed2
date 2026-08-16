import { SHIPPING } from './districts'
import type { CheckoutInput, Order, OrderItem } from './types'
import { normalizeBdPhone, uid } from './utils'

function money(items: OrderItem[], shippingFee: number) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  return { subtotal, total: subtotal + shippingFee }
}

function normText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function qtyOf(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function sameProduct(existing: OrderItem, incoming: OrderItem) {
  const idA = String(existing.productId ?? '').trim()
  const idB = String(incoming.productId ?? '').trim()
  if (idA && idB && idA === idB) return true
  const nameA = normText(String(existing.name ?? ''))
  const nameB = normText(String(incoming.name ?? ''))
  return Boolean(nameA && nameB && nameA === nameB)
}

function sameProductUnit(existing: OrderItem, incoming: OrderItem) {
  return sameProduct(existing, incoming) && qtyOf(existing.quantity) === qtyOf(incoming.quantity)
}

function isOpenOrder(order: Order) {
  return order.status === 'pending'
}

function sameBuyer(order: Order, name: string, phone: string, district: string) {
  return (
    normalizeBdPhone(order.phone) === phone &&
    normText(order.customerName) === normText(name) &&
    normText(order.district) === normText(district)
  )
}

function addItems(existing: OrderItem[], incoming: OrderItem[]): OrderItem[] {
  const next = existing.map((item) => ({ ...item }))
  for (const item of incoming) {
    const index = next.findIndex((row) => row.productId === item.productId)
    if (index >= 0) {
      next[index] = {
        ...next[index],
        quantity: next[index].quantity + item.quantity,
        name: item.name,
        image: item.image,
        price: item.price,
      }
    } else {
      next.push({ ...item })
    }
  }
  return next
}

export function pendingGroupKey(order: Order) {
  return [
    normText(order.customerName),
    normalizeBdPhone(order.phone),
    normText(order.district),
  ].join('|')
}

export function combineOrders(orders: Order[]): Order {
  const [first] = orders
  const items = orders.reduce((all, order) => addItems(all, order.items), [] as OrderItem[])
  const totals = money(items, first.shippingFee)
  const addresses = [...new Set(orders.map((order) => order.address.trim()).filter(Boolean))]
  return {
    ...first,
    items,
    address: addresses.join(' · ') || first.address,
    ...totals,
  }
}

export type OrderRow = {
  key: string
  ids: string[]
  order: Order
}

export function groupOrdersForAdmin(orders: Order[]): OrderRow[] {
  const pending = new Map<string, Order[]>()
  const rows: OrderRow[] = []

  for (const order of orders) {
    if (isOpenOrder(order)) {
      const key = pendingGroupKey(order)
      const list = pending.get(key) ?? []
      list.push(order)
      pending.set(key, list)
      continue
    }
    rows.push({ key: order.id, ids: [order.id], order })
  }

  for (const [key, list] of pending) {
    rows.push({
      key,
      ids: list.map((order) => order.id),
      order: combineOrders(list),
    })
  }

  return rows.sort((a, b) => b.order.createdAt.localeCompare(a.order.createdAt))
}

export const DUPLICATE_PRODUCT_UNIT_MESSAGE =
  'You already ordered this product. Please choose a different product or number of units.'

export class DuplicateProductUnitError extends Error {
  constructor() {
    super(DUPLICATE_PRODUCT_UNIT_MESSAGE)
    this.name = 'DuplicateProductUnitError'
  }
}

export function hasSameProductUnitOrder(orders: Order[], input: CheckoutInput) {
  const phone = normalizeBdPhone(input.phone)
  const name = normText(input.customerName)
  if (!phone || !name) return false
  return orders.some((order) => {
    if (order.status === 'cancelled') return false
    if (normalizeBdPhone(order.phone) !== phone) return false
    if (normText(order.customerName) !== name) return false
    return (order.items ?? []).some((existing) =>
      input.items.some((incoming) => sameProductUnit(existing, incoming)),
    )
  })
}

export function applyIncomingOrder(orders: Order[], input: CheckoutInput) {
  const phone = normalizeBdPhone(input.phone)
  const name = input.customerName.trim()
  const address = input.address.trim()
  const target = orders.find(
    (order) => isOpenOrder(order) && sameBuyer(order, name, phone, input.district),
  )
  const sameProductOnPending =
    target &&
    input.items.some((incoming) => target.items.some((existing) => sameProduct(existing, incoming)))

  // Same product + same units is blocked before this runs. Same product + different
  // units must be a new order, not a quantity merge — otherwise it looks like a 2nd place.
  if (target && !sameProductOnPending) {
    const mergedItems = addItems(target.items, input.items)
    const totals = money(mergedItems, target.shippingFee)
    const patched: Order = {
      ...target,
      items: mergedItems,
      source: target.source || input.source || '',
      campaign: target.campaign || input.campaign || '',
      ...totals,
    }
    return {
      orders: orders.map((order) => (order.id === target.id ? patched : order)),
      saved: patched,
      inserted: null as Order | null,
      updated: [patched],
      merged: true,
    }
  }

  const shippingFee = SHIPPING[input.shippingType].fee
  const totals = money(input.items, shippingFee)
  const created: Order = {
    id: uid('ord'),
    items: input.items,
    customerName: name,
    phone,
    address,
    district: input.district,
    shippingType: input.shippingType,
    shippingFee,
    ...totals,
    status: 'pending',
    notes: input.notes?.trim() ?? '',
    source: input.source?.trim() ?? '',
    campaign: input.campaign?.trim() ?? '',
    createdAt: new Date().toISOString(),
  }
  return {
    orders: [created, ...orders],
    saved: created,
    inserted: created,
    updated: [] as Order[],
    merged: false,
  }
}
