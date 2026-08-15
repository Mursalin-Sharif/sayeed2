import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BellRing, Volume2, VolumeX, X } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import {
  enableAdminAlerts,
  isOrderAlertUnlocked,
  isOrderSoundEnabled,
  notifyDesktopOrder,
  playOrderAlert,
  requestOrderAlertPermission,
  setOrderSoundEnabled,
  startOrderTitleFlash,
  stopOrderTitleFlash,
  unlockOrderAlertAudio,
} from '@/lib/orderAlert'
import type { Order } from '@/lib/types'
import { formatTaka } from '@/lib/utils'

type Toast = { id: string; order: Order }

function orderFingerprint(order: Order) {
  return `${order.id}:${order.items.map((item) => `${item.productId}x${item.quantity}`).join(',')}`
}

export function OrderAlertHost() {
  const { orders, loading, cloud } = useStore()
  const { pathname } = useLocation()
  const onAdmin = pathname.startsWith('/admin')
  const primed = useRef(false)
  const seen = useRef(new Map<string, string>())
  const [ready, setReady] = useState(!cloud)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [needClick, setNeedClick] = useState(false)
  const [soundOn, setSoundOn] = useState(() => isOrderSoundEnabled())
  const [notifyOn, setNotifyOn] = useState(
    () => typeof Notification === 'undefined' || Notification.permission === 'granted',
  )

  useEffect(() => {
    void enableAdminAlerts().then(() => {
      setNotifyOn(typeof Notification === 'undefined' || Notification.permission === 'granted')
    })
  }, [])

  useEffect(() => {
    const unlock = () => {
      unlockOrderAlertAudio()
      void requestOrderAlertPermission().then((status) => {
        setNotifyOn(status === 'granted')
      })
      setNeedClick(false)
    }
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        unlockOrderAlertAudio()
        stopOrderTitleFlash()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
      stopOrderTitleFlash()
    }
  }, [])

  useEffect(() => {
    if (!cloud) {
      setReady(true)
      return
    }
    if (loading) return
    const timer = window.setTimeout(() => setReady(true), 1200)
    return () => window.clearTimeout(timer)
  }, [cloud, loading])

  useEffect(() => {
    if (!ready) return
    if (!primed.current) {
      seen.current = new Map(orders.map((order) => [order.id, orderFingerprint(order)]))
      primed.current = true
      return
    }
    const fresh = orders.filter((order) => seen.current.get(order.id) !== orderFingerprint(order))
    for (const order of orders) seen.current.set(order.id, orderFingerprint(order))
    if (!fresh.length) return

    playOrderAlert()
    if (soundOn && !isOrderAlertUnlocked()) setNeedClick(true)
    startOrderTitleFlash(fresh.length)
    for (const order of fresh) notifyDesktopOrder(order)
    setToasts((prev) => [...fresh.map((order) => ({ id: orderFingerprint(order), order })), ...prev].slice(0, 4))
    const ids = fresh.map((order) => orderFingerprint(order))
    window.setTimeout(() => {
      setToasts((prev) => {
        const next = prev.filter((item) => !ids.includes(item.id))
        if (!next.length) stopOrderTitleFlash()
        return next
      })
    }, 22000)
  }, [orders, ready, soundOn])

  function dismiss(id: string) {
    setToasts((prev) => {
      const next = prev.filter((item) => item.id !== id)
      if (!next.length) stopOrderTitleFlash()
      return next
    })
  }

  function toggleSound() {
    const next = !soundOn
    setOrderSoundEnabled(next)
    setSoundOn(next)
    unlockOrderAlertAudio()
    requestOrderAlertPermission()
    setNeedClick(false)
    if (next) playOrderAlert()
  }

  return (
    <>
      {!notifyOn ? (
        <button
          type="button"
          onClick={() => {
            void enableAdminAlerts(true).then(() => {
              setNotifyOn(Notification.permission === 'granted')
              unlockOrderAlertAudio()
              playOrderAlert()
            })
          }}
          className="fixed left-1/2 top-3 z-[80] -translate-x-1/2 rounded-full bg-amber-400 px-4 py-2 text-xs font-bold text-leaf-deep shadow-lg"
        >
          Allow order alerts
        </button>
      ) : null}

      {onAdmin ? (
        <button
          type="button"
          onClick={toggleSound}
          className="fixed bottom-4 left-4 z-[60] inline-flex items-center gap-2 rounded-full border border-gold/30 bg-[#101a16]/95 px-3 py-2 text-xs font-semibold text-gold shadow-lg backdrop-blur md:bottom-6 md:left-auto md:right-6"
          aria-label={soundOn ? 'Mute order sound' : 'Enable order sound'}
        >
          {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          {soundOn ? 'Order sound on' : 'Order sound off'}
        </button>
      ) : null}

      {needClick && soundOn ? (
        <button
          type="button"
          onClick={() => {
            unlockOrderAlertAudio()
            void requestOrderAlertPermission().then((status) => setNotifyOn(status === 'granted'))
            playOrderAlert()
            setNeedClick(false)
          }}
          className="fixed bottom-16 left-4 z-[60] rounded-2xl border border-amber-400/40 bg-amber-400 px-3 py-2 text-xs font-bold text-leaf-deep shadow-lg md:bottom-[4.5rem] md:left-auto md:right-6"
        >
          Click to enable order sound
        </button>
      ) : null}

      <div className="fixed right-4 top-4 z-[70] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((toast) => (
          <article
            key={toast.id}
            className="overflow-hidden rounded-2xl border border-gold/40 bg-[#101a16] text-cream shadow-2xl shadow-black/40"
          >
            <div className="flex items-start gap-3 p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold text-leaf-deep">
                <BellRing className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold tracking-wide text-gold uppercase">নতুন অর্ডার</p>
                <p className="mt-0.5 truncate font-semibold">{toast.order.customerName}</p>
                <p className="truncate text-sm text-zinc-300">{toast.order.phone}</p>
                <p className="mt-1 truncate text-sm text-cream">
                  {toast.order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}
                </p>
                <p className="mt-1 font-bold text-gold">{formatTaka(toast.order.total)}</p>
                <Link
                  to="/admin/orders"
                  onClick={() => dismiss(toast.id)}
                  className="mt-2 inline-block text-sm font-semibold text-gold underline"
                >
                  Open orders
                </Link>
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
                aria-label="Dismiss"
              >
                <X className="size-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
