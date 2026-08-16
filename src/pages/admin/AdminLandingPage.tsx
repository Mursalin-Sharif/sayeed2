import { useEffect, useState, type FormEvent } from 'react'
import { Copy, Check } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { normalizeLanding } from '@/lib/seed'

function publicOrigin() {
  if (typeof window === 'undefined') return ''
  const { hostname, origin } = window.location
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return (import.meta.env.VITE_SITE_URL || 'https://sayeed2.vercel.app').replace(/\/$/, '')
  }
  return origin
}

function adsUrl() {
  return `${publicOrigin()}/landing?utm_source=facebook&utm_medium=cpc&utm_campaign=offer`
}

export function AdminLandingPage() {
  const { landing, saveLanding, products } = useStore()
  const [form, setForm] = useState(() => normalizeLanding(landing))
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [copied, setCopied] = useState(false)
  const [landingUrl, setLandingUrl] = useState('')

  useEffect(() => {
    setForm(normalizeLanding(landing))
  }, [landing])

  useEffect(() => {
    setLandingUrl(adsUrl())
  }, [])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setNotice('')
    try {
      await saveLanding(
        normalizeLanding({
          ...form,
          packageItems: form.packageItems.map((item) => item.trim()).filter(Boolean),
          whyItems: form.whyItems.map((item) => item.trim()).filter(Boolean),
        }),
      )
      setNotice('Landing page saved.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function copyLandingUrl() {
    try {
      await navigator.clipboard.writeText(landingUrl || adsUrl())
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setNotice('Copy failed — select the URL and copy it yourself.')
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-4">
      <h1 className="font-display text-3xl text-gold">Landing page content</h1>
      {notice ? (
        <p className={`text-sm font-semibold ${notice.includes('saved') ? 'text-emerald-400' : 'text-red-400'}`}>
          {notice}
        </p>
      ) : null}

      <section className="rounded-2xl border border-gold/30 bg-gold/10 p-4 space-y-3">
        <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">Facebook ads</p>
        <p className="text-sm text-zinc-200">
          Use this URL in Meta Ads. It follows the live domain automatically. Orders from this page show as Facebook in Admin → Orders.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            readOnly
            value={landingUrl}
            className="w-full rounded-xl bg-black/30 px-3 py-3 text-sm text-zinc-100"
          />
          <button
            type="button"
            onClick={() => void copyLandingUrl()}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-sm font-bold text-leaf-deep"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? 'Copied' : 'Copy URL'}
          </button>
        </div>
        <label className="block text-sm text-zinc-300">
          Meta Pixel ID
          <input
            value={form.metaPixelId}
            onChange={(e) => setForm({ ...form, metaPixelId: e.target.value.replace(/\s/g, '') })}
            placeholder="Paste from Meta Events Manager"
            className="mt-1 w-full rounded-xl bg-black/30 px-3 py-3 text-zinc-100"
          />
        </label>
        <p className="text-xs text-zinc-400">
          {form.metaPixelId
            ? 'Pixel is on. Save, then PageView, ViewContent, AddToCart, InitiateCheckout and Purchase will fire.'
            : 'Paste the Pixel ID here and click Save. Until then Facebook cannot track.'}
        </p>
      </section>

      <label className="block text-sm text-zinc-400">
        Hero title
        <input
          value={form.heroTitle}
          onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Hero subtitle
        <input
          value={form.heroSubtitle}
          onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Package title
        <input
          value={form.packageTitle}
          onChange={(e) => setForm({ ...form, packageTitle: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Package items (one per line)
        <textarea
          value={form.packageItems.join('\n')}
          onChange={(e) => setForm({ ...form, packageItems: e.target.value.split('\n') })}
          className="mt-1 min-h-40 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
        <span className="mt-1 block text-xs text-zinc-500">
          Number a line yourself with 1. 2. 3. — that count is shown on the landing page. Lines without a number show as headings. Use Title: details to split heading and description.
        </span>
      </label>
      <label className="block text-sm text-zinc-400">
        Story title
        <input
          value={form.storyTitle}
          onChange={(e) => setForm({ ...form, storyTitle: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Story body
        <textarea
          value={form.storyBody}
          onChange={(e) => setForm({ ...form, storyBody: e.target.value })}
          className="mt-1 min-h-28 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Why title
        <input
          value={form.whyTitle}
          onChange={(e) => setForm({ ...form, whyTitle: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Why items (one per line)
        <textarea
          value={form.whyItems.join('\n')}
          onChange={(e) => setForm({ ...form, whyItems: e.target.value.split('\n') })}
          className="mt-1 min-h-28 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Payment title
        <input
          value={form.paymentTitle}
          onChange={(e) => setForm({ ...form, paymentTitle: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Payment number
        <input
          value={form.paymentNumber}
          onChange={(e) => setForm({ ...form, paymentNumber: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Payment note
        <input
          value={form.paymentNote}
          onChange={(e) => setForm({ ...form, paymentNote: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Offer product
        <select
          value={form.offerProductId}
          onChange={(e) => setForm({ ...form, offerProductId: e.target.value })}
          className="admin-select mt-1 w-full rounded-xl bg-[#0b1210] px-3 py-3 text-zinc-100"
        >
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={saving} className="rounded-xl bg-gold px-6 py-3 font-bold text-leaf-deep disabled:opacity-60">
        {saving ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
