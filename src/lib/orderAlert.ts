import type { Order } from '@/lib/types'
import { formatTaka } from '@/lib/utils'

const SOUND_KEY = 'js-agro-shop-order-sound'
let audioCtx: AudioContext | null = null
let titleTimer: number | null = null
let baseTitle = typeof document === 'undefined' ? 'JS Agro Shop' : document.title

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext }

function contextCtor() {
  const w = window as WebkitWindow
  return window.AudioContext || w.webkitAudioContext
}

export function isOrderSoundEnabled() {
  return localStorage.getItem(SOUND_KEY) !== '0'
}

export function setOrderSoundEnabled(on: boolean) {
  localStorage.setItem(SOUND_KEY, on ? '1' : '0')
}

export function unlockOrderAlertAudio() {
  const Ctor = contextCtor()
  if (!Ctor) return
  if (!audioCtx) audioCtx = new Ctor()
  if (audioCtx.state === 'suspended') void audioCtx.resume()
}

export function isOrderAlertUnlocked() {
  return audioCtx?.state === 'running'
}

function bassHit(ctx: AudioContext, start: number, volume: number) {
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(420, start)
  filter.Q.setValueAtTime(0.9, start)

  const master = ctx.createGain()
  master.gain.setValueAtTime(0.0001, start)
  master.gain.exponentialRampToValueAtTime(volume, start + 0.03)
  master.gain.exponentialRampToValueAtTime(volume * 0.45, start + 0.18)
  master.gain.exponentialRampToValueAtTime(0.0001, start + 0.55)
  filter.connect(master)
  master.connect(ctx.destination)

  const layers: Array<[OscillatorType, number, number]> = [
    ['sine', 75, 0.9],
    ['triangle', 110, 0.7],
    ['square', 165, 0.22],
    ['sine', 220, 0.35],
  ]

  for (const [type, freq, mix] of layers) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, start)
    osc.frequency.exponentialRampToValueAtTime(freq * 0.72, start + 0.42)
    gain.gain.setValueAtTime(mix, start)
    osc.connect(gain)
    gain.connect(filter)
    osc.start(start)
    osc.stop(start + 0.58)
  }
}

export function playOrderAlert() {
  if (!isOrderSoundEnabled()) return
  try {
    unlockOrderAlertAudio()
    if (!audioCtx) return
    const now = audioCtx.currentTime
    bassHit(audioCtx, now, 0.85)
    bassHit(audioCtx, now + 0.38, 1)
    bassHit(audioCtx, now + 0.92, 0.9)
  } catch {
    // Autoplay can still be blocked until the admin clicks once.
  }
}

export function startOrderTitleFlash(count: number) {
  if (titleTimer == null) baseTitle = document.title.replace(/^\(\d+\)\s*/, '').replace(/^🔔\s*/, '')
  stopOrderTitleFlash(false)
  const alertTitle = count > 1 ? `(${count}) নতুন অর্ডার` : '🔔 নতুন অর্ডার'
  let on = false
  titleTimer = window.setInterval(() => {
    on = !on
    document.title = on ? alertTitle : baseTitle
  }, 800)
}

export function stopOrderTitleFlash(restore = true) {
  if (titleTimer != null) {
    window.clearInterval(titleTimer)
    titleTimer = null
  }
  if (restore) document.title = baseTitle
}

export function notifyDesktopOrder(order: Order) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  try {
    const note = new Notification('নতুন অর্ডার এসেছে', {
      body: `${order.customerName} · ${order.phone} · ${formatTaka(order.total)}`,
      tag: `order-${order.id}`,
      silent: true,
    })
    note.onclick = () => {
      window.focus()
      note.close()
    }
  } catch {
    // Ignore browsers that block Notification construction.
  }
}

export function requestOrderAlertPermission() {
  if (!('Notification' in window) || Notification.permission !== 'default') return
  void Notification.requestPermission()
}
