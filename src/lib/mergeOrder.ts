import { SHIPPING } from './districts'
import type { CheckoutInput, Order, OrderItem } from './types'
import { normalizeBdPhone, uid } from './utils'

function money(items: OrderItem[], shippingFee: number) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  return { subtotal, total: subtotal + shippingFee }
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

export function applyIncomingOrder(orders: Order[], input: CheckoutInput) {
  const phone = normalizeBdPhone(input.phone)
  let next = [...orders]
  const leftover: OrderItem[] = []
  const mergeById = new Map<string, OrderItem[]>()

  for (const item of input.items) {
    const target = next.find(
      (order) =>
        order.status === 'pending' &&
        normalizeBdPhone(order.phone) === phone &&
        order.items.some((row) => row.productId === item.productId),
    )
    if (target) {
      const bucket = mergeById.get(target.id) ?? []
      bucket.push(item)
      mergeById.set(target.id, bucket)
    } else {
      leftover.push(item)
    }
  }

  const updated: Order[] = []
  for (const [id, items] of mergeById) {
    next = next.map((order) => {
      if (order.id !== id) return order
      const mergedItems = addItems(order.items, items)
      const totals = money(mergedItems, order.shippingFee)
      const patched: Order = {
        ...order,
        items: mergedItems,
        customerName: input.customerName.trim() || order.customerName,
        address: input.address.trim() || order.address,
        district: input.district || order.district,
        ...totals,
      }
      updated.push(patched)
      return patched
    })
  }

  if (leftover.length) {
    const shippingFee = SHIPPING[input.shippingType].fee
    const totals = money(leftover, shippingFee)
    const created: Order = {
      id: uid('ord'),
      items: leftover,
      customerName: input.customerName.trim(),
      phone,
      address: input.address.trim(),
      district: input.district,
      shippingType: input.shippingType,
      shippingFee,
      ...totals,
      status: 'pending',
      notes: input.notes?.trim() ?? '',
      createdAt: new Date().toISOString(),
    }
    return {
      orders: [created, ...next],
      saved: created,
      inserted: created,
      updated,
      merged: false,
    }
  }

  return {
    orders: next,
    saved: updated[0],
    inserted: null as Order | null,
    updated,
    merged: true,
  }
}
