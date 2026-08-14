import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CartItem, Product } from '@/lib/types'

const KEY = 'js-agro-shop-cart-v1'

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

type CartContextValue = {
  items: CartItem[]
  count: number
  add: (productId: string, quantity?: number) => void
  setQty: (productId: string, quantity: number) => void
  remove: (productId: string) => void
  clear: () => void
  lines: (products: Product[]) => { product: Product; quantity: number }[]
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readCart)

  const persist = useCallback((next: CartItem[]) => {
    localStorage.setItem(KEY, JSON.stringify(next))
    return next
  }, [])

  const add = useCallback(
    (productId: string, quantity = 1) => {
      setItems((prev) =>
        persist(
          prev.some((item) => item.productId === productId)
            ? prev.map((item) =>
                item.productId === productId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              )
            : [...prev, { productId, quantity }],
        ),
      )
    },
    [persist],
  )

  const setQty = useCallback(
    (productId: string, quantity: number) => {
      setItems((prev) =>
        persist(
          quantity < 1
            ? prev.filter((item) => item.productId !== productId)
            : prev.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
        ),
      )
    },
    [persist],
  )

  const remove = useCallback(
    (productId: string) => {
      setItems((prev) => persist(prev.filter((item) => item.productId !== productId)))
    },
    [persist],
  )

  const clear = useCallback(() => {
    setItems(persist([]))
  }, [persist])

  const lines = useCallback(
    (products: Product[]) =>
      items
        .map((item) => {
          const product = products.find((row) => row.id === item.productId)
          return product ? { product, quantity: item.quantity } : null
        })
        .filter((row): row is { product: Product; quantity: number } => Boolean(row)),
    [items],
  )

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      add,
      setQty,
      remove,
      clear,
      lines,
    }),
    [items, add, setQty, remove, clear, lines],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
