import type { Order } from '@/lib/types'
import { formatTaka } from '@/lib/utils'

const SOUND_KEY = 'js-agro-shop-order-sound'
let audioCtx: AudioContext | null = null
let htmlAudio: HTMLAudioElement | null = null
let audioUnlocked = false
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

function makeBassWavUrl() {
  const sampleRate = 22050
  const seconds = 1.45
  const count = Math.floor(sampleRate * seconds)
  const pcm = new Int16Array(count)
  const hits = [0, 0.38, 0.92]
  for (let i = 0; i < count; i += 1) {
    const t = i / sampleRate
    let sample = 0
    for (const start of hits) {
      const x = t - start
      if (x >= 0 && x < 0.48) {
        const env = Math.exp(-x * 7)
        sample += Math.sin(2 * Math.PI * 85 * x) * env
        sample += Math.sin(2 * Math.PI * 130 * x) * env * 0.55
        sample += Math.sin(2 * Math.PI * 55 * x) * env * 0.7
      }
    }
    pcm[i] = Math.max(-1, Math.min(1, sample)) * 32767 * 0.95
  }
  const bytes = pcm.byteLength
  const buffer = new ArrayBuffer(44 + bytes)
  const view = new DataView(buffer)
  const write = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i))
  }
  write(0, 'RIFF')
  view.setUint32(4, 36 + bytes, true)
  write(8, 'WAVE')
  write(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  write(36, 'data')
  view.setUint32(40, bytes, true)
  new Uint8Array(buffer, 44).set(new Uint8Array(pcm.buffer))
  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }))
}

function ensureHtmlAudio() {
  if (htmlAudio) return htmlAudio
  htmlAudio = new Audio(makeBassWavUrl())
  htmlAudio.preload = 'auto'
  return htmlAudio
}

export function unlockOrderAlertAudio() {
  const Ctor = contextCtor()
  if (Ctor) {
    if (!audioCtx) audioCtx = new Ctor()
    if (audioCtx.state === 'suspended') void audioCtx.resume()
  }
  const audio = ensureHtmlAudio()
  if (audioUnlocked) {
    audio.muted = false
    return
  }
  audio.muted = true
  const play = audio.play()
  if (play) {
    void play
      .then(() => {
        audio.pause()
        audio.currentTime = 0
        audio.muted = false
        audioUnlocked = true
      })
      .catch(() => {})
  }
}

export function isOrderAlertUnlocked() {
  return audioCtx?.state === 'running' || Boolean(htmlAudio)
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
    const Ctor = contextCtor()
    if (Ctor) {
      if (!audioCtx) audioCtx = new Ctor()
      if (audioCtx.state === 'suspended') void audioCtx.resume()
    }
    if (audioCtx) {
      const now = audioCtx.currentTime
      bassHit(audioCtx, now, 0.85)
      bassHit(audioCtx, now + 0.38, 1)
      bassHit(audioCtx, now + 0.92, 0.9)
    }
    const audio = ensureHtmlAudio()
    audio.muted = false
    audio.currentTime = 0
    void audio.play().catch(() => {})
    navigator.vibrate?.([200, 80, 220, 80, 350])
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

export async function requestOrderAlertPermission() {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return Notification.requestPermission()
}

export async function notifyDesktopOrder(order: Order) {
  if (!isOrderSoundEnabled()) return
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const title = 'নতুন অর্ডার এসেছে'
  const items = order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')
  const body = `${order.customerName} · ${order.phone} · ${items} · ${formatTaka(order.total)}`
  const tag = `order-${order.id}-${order.items.map((item) => item.quantity).join('x')}`
  const payload = {
    type: 'ORDER_ALERT' as const,
    title,
    body,
    tag,
    url: '/admin/orders',
  }
  try {
    const registration = await navigator.serviceWorker?.ready
    if (registration?.active) {
      registration.active.postMessage(payload)
      return
    }
    if (registration?.showNotification) {
      await registration.showNotification(title, {
        body,
        icon: '/js-agro-shop-logo.png',
        badge: '/js-agro-shop-logo.png',
        tag,
        silent: false,
        requireInteraction: true,
        data: { url: '/admin/orders' },
      } as NotificationOptions)
      return
    }
  } catch {
    // Fall through to page Notification.
  }
  try {
    const note = new Notification(title, {
      body,
      icon: '/js-agro-shop-logo.png',
      tag,
      silent: false,
      requireInteraction: true,
    })
    note.onclick = () => {
      window.focus()
      note.close()
    }
  } catch {
    // Ignore browsers that block Notification construction.
  }
}

export async function enableAdminAlerts(prompt = false) {
  if (prompt) await requestOrderAlertPermission()
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
    } catch {
      // Keep in-page alerts working if SW registration fails.
    }
  }
  if (!prompt || Notification.permission === 'granted') unlockOrderAlertAudio()
}
