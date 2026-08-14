import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  CarouselSlide,
  CheckoutInput,
  ContactMessage,
  LandingContent,
  LandingMedia,
  Order,
  Product,
  StoreSnapshot,
} from '@/lib/types'
import { SHIPPING } from '@/lib/districts'
import { uid } from '@/lib/utils'
import { customersFromOrders, loadSnapshot, saveSnapshot } from '@/lib/localStore'
import {
  cloudDeleteMedia,
  cloudDeleteOrder,
  cloudDeleteProduct,
  cloudDeleteSlide,
  cloudInsertOrder,
  cloudSaveLanding,
  cloudUpdateOrderStatus,
  cloudUpsertMedia,
  cloudUpsertProduct,
  cloudUpsertSlide,
  fetchCloudSnapshot,
} from '@/lib/cloud'
import { isSupabaseEnabled } from '@/lib/supabase'

type StoreContextValue = StoreSnapshot & {
  loading: boolean
  cloud: boolean
  saveProduct: (product: Product) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  placeOrder: (input: CheckoutInput) => Promise<Order>
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>
  deleteOrder: (id: string) => Promise<void>
  saveSlide: (slide: CarouselSlide) => Promise<void>
  deleteSlide: (id: string) => Promise<void>
  saveMedia: (item: LandingMedia) => Promise<void>
  deleteMedia: (id: string) => Promise<void>
  saveLanding: (landing: LandingContent) => Promise<void>
  addMessage: (input: Omit<ContactMessage, 'id' | 'read' | 'createdAt'>) => Promise<ContactMessage>
  markMessageRead: (id: string) => Promise<void>
  deleteMessage: (id: string) => Promise<void>
}

const StoreContext = createContext<StoreContextValue | null>(null)

function persist(next: StoreSnapshot) {
  return saveSnapshot({ ...next, messages: next.messages ?? [], customers: customersFromOrders(next.orders) })
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<StoreSnapshot>(() => loadSnapshot())
  const [loading, setLoading] = useState(isSupabaseEnabled)

  useEffect(() => {
    if (!isSupabaseEnabled) return
    let cancelled = false
    fetchCloudSnapshot()
      .then((cloud) => {
        if (!cancelled && cloud && cloud.products.length) {
          setSnapshot(persist(cloud))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const commit = useCallback((updater: (prev: StoreSnapshot) => StoreSnapshot) => {
    setSnapshot((prev) => persist(updater(prev)))
  }, [])

  const saveProduct = useCallback(
    async (product: Product) => {
      commit((prev) => ({
        ...prev,
        products: prev.products.some((item) => item.id === product.id)
          ? prev.products.map((item) => (item.id === product.id ? product : item))
          : [product, ...prev.products],
      }))
      await cloudUpsertProduct(product)
    },
    [commit],
  )

  const deleteProduct = useCallback(
    async (id: string) => {
      commit((prev) => ({ ...prev, products: prev.products.filter((item) => item.id !== id) }))
      await cloudDeleteProduct(id)
    },
    [commit],
  )

  const placeOrder = useCallback(
    async (input: CheckoutInput) => {
      const shippingFee = SHIPPING[input.shippingType].fee
      const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const order: Order = {
        id: uid('ord'),
        items: input.items,
        customerName: input.customerName.trim(),
        phone: input.phone.trim(),
        address: input.address.trim(),
        district: input.district,
        shippingType: input.shippingType,
        shippingFee,
        subtotal,
        total: subtotal + shippingFee,
        status: 'pending',
        notes: input.notes?.trim() ?? '',
        createdAt: new Date().toISOString(),
      }
      commit((prev) => ({ ...prev, orders: [order, ...prev.orders] }))
      await cloudInsertOrder(order)
      return order
    },
    [commit],
  )

  const updateOrderStatus = useCallback(
    async (id: string, status: Order['status']) => {
      commit((prev) => ({
        ...prev,
        orders: prev.orders.map((order) => (order.id === id ? { ...order, status } : order)),
      }))
      await cloudUpdateOrderStatus(id, status)
    },
    [commit],
  )

  const deleteOrder = useCallback(
    async (id: string) => {
      commit((prev) => ({ ...prev, orders: prev.orders.filter((order) => order.id !== id) }))
      await cloudDeleteOrder(id)
    },
    [commit],
  )

  const saveSlide = useCallback(
    async (slide: CarouselSlide) => {
      commit((prev) => ({
        ...prev,
        slides: prev.slides.some((item) => item.id === slide.id)
          ? prev.slides.map((item) => (item.id === slide.id ? slide : item))
          : [...prev.slides, slide],
      }))
      await cloudUpsertSlide(slide)
    },
    [commit],
  )

  const deleteSlide = useCallback(
    async (id: string) => {
      commit((prev) => ({ ...prev, slides: prev.slides.filter((item) => item.id !== id) }))
      await cloudDeleteSlide(id)
    },
    [commit],
  )

  const saveMedia = useCallback(
    async (item: LandingMedia) => {
      commit((prev) => ({
        ...prev,
        media: prev.media.some((row) => row.id === item.id)
          ? prev.media.map((row) => (row.id === item.id ? item : row))
          : [...prev.media, item],
      }))
      await cloudUpsertMedia(item)
    },
    [commit],
  )

  const deleteMedia = useCallback(
    async (id: string) => {
      commit((prev) => ({ ...prev, media: prev.media.filter((item) => item.id !== id) }))
      await cloudDeleteMedia(id)
    },
    [commit],
  )

  const saveLanding = useCallback(
    async (landing: LandingContent) => {
      commit((prev) => ({ ...prev, landing }))
      await cloudSaveLanding(landing)
    },
    [commit],
  )

  const addMessage = useCallback(
    async (input: Omit<ContactMessage, 'id' | 'read' | 'createdAt'>) => {
      const message: ContactMessage = {
        id: uid('msg'),
        ...input,
        read: false,
        createdAt: new Date().toISOString(),
      }
      commit((prev) => ({ ...prev, messages: [message, ...(prev.messages ?? [])] }))
      return message
    },
    [commit],
  )

  const markMessageRead = useCallback(
    async (id: string) => {
      commit((prev) => ({
        ...prev,
        messages: (prev.messages ?? []).map((item) => (item.id === id ? { ...item, read: true } : item)),
      }))
    },
    [commit],
  )

  const deleteMessage = useCallback(
    async (id: string) => {
      commit((prev) => ({
        ...prev,
        messages: (prev.messages ?? []).filter((item) => item.id !== id),
      }))
    },
    [commit],
  )

  const value = useMemo<StoreContextValue>(
    () => ({
      ...snapshot,
      messages: snapshot.messages ?? [],
      loading,
      cloud: isSupabaseEnabled,
      saveProduct,
      deleteProduct,
      placeOrder,
      updateOrderStatus,
      deleteOrder,
      saveSlide,
      deleteSlide,
      saveMedia,
      deleteMedia,
      saveLanding,
      addMessage,
      markMessageRead,
      deleteMessage,
    }),
    [
      snapshot,
      loading,
      saveProduct,
      deleteProduct,
      placeOrder,
      updateOrderStatus,
      deleteOrder,
      saveSlide,
      deleteSlide,
      saveMedia,
      deleteMedia,
      saveLanding,
      addMessage,
      markMessageRead,
      deleteMessage,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
