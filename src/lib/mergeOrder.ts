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

function isOpenOrder(order: Order) {
  return order.status === 'pending'
}

function sameBuyer(order: Order, name: string, phone: string, address: string, district: string) {
  return (
    normalizeBdPhone(order.phone) === phone &&
    normText(order.customerName) === normText(name) &&
    normText(order.address) === normText(address) &&
    normText(order.district) === normText(district)
  )
}

function isSameProductOrder(order: Order, productId: string) {
  return order.items.length > 0 && order.items.every((item) => item.productId === productId)
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
  const name = input.customerName.trim()
  const address = input.address.trim()
  let next = [...orders]
  const leftover: OrderItem[] = []
  const mergeById = new Map<string, OrderItem[]>()

  for (const item of input.items) {
    const target = next.find(
      (order) =>
        isOpenOrder(order) &&
        sameBuyer(order, name, phone, address, input.district) &&
        isSameProductOrder(order, item.productId),
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
      customerName: name,
      phone,
      address,
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
