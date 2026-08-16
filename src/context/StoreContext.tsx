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
  SiteContent,
  StoreSnapshot,
} from '@/lib/types'
import { uid } from '@/lib/utils'
import { customersFromOrders, loadSnapshot, onLocalSnapshotChange, saveSnapshot } from '@/lib/localStore'
import {
  cloudDeleteMedia,
  cloudDeleteOrder,
  cloudDeleteProduct,
  cloudDeleteSlide,
  cloudInsertOrder,
  cloudSaveLanding,
  cloudSaveSite,
  cloudUpdateOrder,
  cloudUpdateOrderStatus,
  cloudUpsertMedia,
  cloudUpsertProduct,
  cloudUpsertSlide,
  fetchCloudOrders,
  fetchCloudSnapshot,
  subscribeToOrders,
} from '@/lib/cloud'
import { isSupabaseEnabled } from '@/lib/supabase'
import { applyIncomingOrder, DuplicateProductUnitError, hasSameProductUnitOrder } from '@/lib/mergeOrder'
import { readAttribution } from '@/lib/metaPixel'
import { seedSite } from '@/lib/seed'

type StoreContextValue = StoreSnapshot & {
  loading: boolean
  cloud: boolean
  syncError: string
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
  saveSite: (site: SiteContent) => Promise<void>
  addMessage: (input: Omit<ContactMessage, 'id' | 'read' | 'createdAt'>) => Promise<ContactMessage>
  markMessageRead: (id: string) => Promise<void>
  deleteMessage: (id: string) => Promise<void>
}

const StoreContext = createContext<StoreContextValue | null>(null)

function persist(next: StoreSnapshot) {
  return saveSnapshot({ ...next, messages: next.messages ?? [], customers: customersFromOrders(next.orders) })
}

function ordersKey(orders: Order[]) {
  return orders
    .map((order) => `${order.id}:${order.status}:${order.items.map((item) => `${item.productId}x${item.quantity}`).join(',')}`)
    .join('|')
}

function mergeRemoteOrders(prev: StoreSnapshot, remote: Order[]): StoreSnapshot {
  const remoteIds = new Set(remote.map((order) => order.id))
  const cutoff = Date.now() - 90_000
  const inFlight = prev.orders.filter(
    (order) => !remoteIds.has(order.id) && new Date(order.createdAt).getTime() > cutoff,
  )
  const orders = [...inFlight, ...remote]
  if (ordersKey(prev.orders) === ordersKey(orders)) return prev
  return persist({ ...prev, orders })
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<StoreSnapshot>(() => loadSnapshot())
  const [loading, setLoading] = useState(isSupabaseEnabled)
  const [syncError, setSyncError] = useState('')

  useEffect(() => {
    if (!isSupabaseEnabled) return
    let cancelled = false
    fetchCloudSnapshot()
      .then((cloud) => {
        if (cancelled || !cloud?.products.length) return
        setSnapshot((prev) => {
          const landing = cloud.landing.heroTitle ? cloud.landing : prev.landing
          return persist({
            ...cloud,
            landing: {
              ...landing,
              metaPixelId: landing.metaPixelId?.trim() || prev.landing.metaPixelId,
              offerTitle: landing.offerTitle?.trim() || prev.landing.offerTitle || '',
              offerPrice: landing.offerPrice > 0 ? landing.offerPrice : prev.landing.offerPrice || 0,
              offerComparePrice: landing.offerComparePrice ?? prev.landing.offerComparePrice ?? null,
              offerMediaIds: Array.isArray(landing.offerMediaIds)
                ? landing.offerMediaIds
                : prev.landing.offerMediaIds ?? [],
              ctaLabel: landing.ctaLabel?.trim() || prev.landing.ctaLabel,
              checkoutTitle: landing.checkoutTitle?.trim() || prev.landing.checkoutTitle,
              helpTitle: landing.helpTitle?.trim() || prev.landing.helpTitle,
              helpSubtitle: landing.helpSubtitle?.trim() || prev.landing.helpSubtitle,
            },
            media: cloud.media.length ? cloud.media : prev.media,
            slides: cloud.slides.length ? cloud.slides : prev.slides,
            messages: cloud.messages.length ? cloud.messages : prev.messages ?? [],
            site:
              cloud.site &&
              cloud.site.name === seedSite.name &&
              cloud.site.phone === seedSite.phone &&
              cloud.site.slogan === seedSite.slogan
                ? prev.site ?? cloud.site
                : cloud.site ?? prev.site,
          })
        })
      })
      .catch((error: unknown) => {
        if (!cancelled) setSyncError(error instanceof Error ? error.message : 'Cloud load failed')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    return onLocalSnapshotChange(() => {
      setSnapshot(loadSnapshot())
    })
  }, [])

  useEffect(() => {
    if (!isSupabaseEnabled) return
    const unsub = subscribeToOrders({
      onInsert: (order) => {
        setSnapshot((prev) => {
          if (prev.orders.some((item) => item.id === order.id)) return prev
          return persist({ ...prev, orders: [order, ...prev.orders] })
        })
      },
      onUpdate: (order) => {
        setSnapshot((prev) => {
          if (!prev.orders.some((item) => item.id === order.id)) {
            return persist({ ...prev, orders: [order, ...prev.orders] })
          }
          return persist({
            ...prev,
            orders: prev.orders.map((item) => (item.id === order.id ? order : item)),
          })
        })
      },
      onDelete: (id) => {
        setSnapshot((prev) => persist({ ...prev, orders: prev.orders.filter((item) => item.id !== id) }))
      },
    })
    const pull = () => {
      void fetchCloudOrders().then((remote) => {
        if (!remote) return
        setSnapshot((prev) => mergeRemoteOrders(prev, remote))
      })
    }
    pull()
    const poll = window.setInterval(pull, 8000)
    return () => {
      unsub()
      window.clearInterval(poll)
    }
  }, [])

  const commit = useCallback((updater: (prev: StoreSnapshot) => StoreSnapshot) => {
    setSnapshot((prev) => persist(updater(prev)))
  }, [])

  const sync = useCallback(async (task: () => Promise<void>) => {
    try {
      await task()
      setSyncError('')
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Cloud sync failed')
    }
  }, [])

  const saveProduct = useCallback(
    async (product: Product) => {
      commit((prev) => ({
        ...prev,
        products: prev.products.some((item) => item.id === product.id)
          ? prev.products.map((item) => (item.id === product.id ? product : item))
          : [product, ...prev.products],
      }))
      await sync(() => cloudUpsertProduct(product))
    },
    [commit, sync],
  )

  const deleteProduct = useCallback(
    async (id: string) => {
      commit((prev) => ({ ...prev, products: prev.products.filter((item) => item.id !== id) }))
      await sync(() => cloudDeleteProduct(id))
    },
    [commit, sync],
  )

  const placeOrder = useCallback(
    async (input: CheckoutInput) => {
      const attr = readAttribution()
      const remote = await fetchCloudOrders()
      const payload = {
        ...input,
        source: input.source || attr.source,
        campaign: input.campaign || attr.campaign,
      }
      let outcome: ReturnType<typeof applyIncomingOrder> | null = null
      let duplicate = false
      commit((prev) => {
        const orders = remote ?? prev.orders
        if (hasSameProductUnitOrder(orders, payload)) {
          duplicate = true
          return prev
        }
        outcome = applyIncomingOrder(orders, payload)
        return { ...prev, orders: outcome.orders }
      })
      if (duplicate) throw new DuplicateProductUnitError()
      if (!outcome) throw new Error('Order failed')
      const result = outcome as ReturnType<typeof applyIncomingOrder>
      await sync(async () => {
        if (result.inserted) await cloudInsertOrder(result.inserted)
        for (const order of result.updated) await cloudUpdateOrder(order)
      })
      return result.saved
    },
    [commit, sync],
  )

  const updateOrderStatus = useCallback(
    async (id: string, status: Order['status']) => {
      commit((prev) => ({
        ...prev,
        orders: prev.orders.map((order) => (order.id === id ? { ...order, status } : order)),
      }))
      await sync(() => cloudUpdateOrderStatus(id, status))
    },
    [commit, sync],
  )

  const deleteOrder = useCallback(
    async (id: string) => {
      commit((prev) => ({ ...prev, orders: prev.orders.filter((order) => order.id !== id) }))
      await sync(() => cloudDeleteOrder(id))
    },
    [commit, sync],
  )

  const saveSlide = useCallback(
    async (slide: CarouselSlide) => {
      commit((prev) => ({
        ...prev,
        slides: prev.slides.some((item) => item.id === slide.id)
          ? prev.slides.map((item) => (item.id === slide.id ? slide : item))
          : [...prev.slides, slide],
      }))
      await sync(() => cloudUpsertSlide(slide))
    },
    [commit, sync],
  )

  const deleteSlide = useCallback(
    async (id: string) => {
      commit((prev) => ({ ...prev, slides: prev.slides.filter((item) => item.id !== id) }))
      await sync(() => cloudDeleteSlide(id))
    },
    [commit, sync],
  )

  const saveMedia = useCallback(
    async (item: LandingMedia) => {
      commit((prev) => ({
        ...prev,
        media: prev.media.some((row) => row.id === item.id)
          ? prev.media.map((row) => (row.id === item.id ? item : row))
          : [...prev.media, item],
      }))
      await sync(() => cloudUpsertMedia(item))
    },
    [commit, sync],
  )

  const deleteMedia = useCallback(
    async (id: string) => {
      commit((prev) => ({ ...prev, media: prev.media.filter((item) => item.id !== id) }))
      await sync(() => cloudDeleteMedia(id))
    },
    [commit, sync],
  )

  const saveLanding = useCallback(
    async (landing: LandingContent) => {
      commit((prev) => ({ ...prev, landing }))
      await sync(() => cloudSaveLanding(landing))
    },
    [commit, sync],
  )

  const saveSite = useCallback(
    async (site: SiteContent) => {
      commit((prev) => ({ ...prev, site }))
      await sync(() => cloudSaveSite(site))
    },
    [commit, sync],
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
    [commit, sync],
  )

  const markMessageRead = useCallback(
    async (id: string) => {
      commit((prev) => ({
        ...prev,
        messages: (prev.messages ?? []).map((item) => (item.id === id ? { ...item, read: true } : item)),
      }))
    },
    [commit, sync],
  )

  const deleteMessage = useCallback(
    async (id: string) => {
      commit((prev) => ({
        ...prev,
        messages: (prev.messages ?? []).filter((item) => item.id !== id),
      }))
    },
    [commit, sync],
  )

  const value = useMemo<StoreContextValue>(
    () => ({
      ...snapshot,
      messages: snapshot.messages ?? [],
      loading,
      cloud: isSupabaseEnabled,
      syncError,
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
      saveSite,
      addMessage,
      markMessageRead,
      deleteMessage,
    }),
    [
      snapshot,
      loading,
      syncError,
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
      saveSite,
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
