import { useEffect, useState, type FormEvent } from 'react'
import { useStore } from '@/context/StoreContext'
import { normalizeSite } from '@/lib/seed'

export function AdminSitePage() {
  const { site, saveSite } = useStore()
  const [form, setForm] = useState(() => normalizeSite(site))
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    setForm(normalizeSite(site))
  }, [site])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setNotice('')
    try {
      await saveSite(normalizeSite(form))
      setNotice('Website settings saved. Home, header, footer and contact now use these values.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-4">
      <div>
        <h1 className="font-display text-3xl text-gold">Website</h1>
        <p className="mt-1 text-sm text-zinc-400">
          These fields control the home page, header, footer and contact page.
        </p>
        {notice ? (
          <p className={`mt-2 text-sm font-semibold ${notice.includes('saved') ? 'text-emerald-400' : 'text-red-400'}`}>
            {notice}
          </p>
        ) : null}
      </div>

      <label className="block text-sm text-zinc-400">
        Shop name
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Shop name (English / footer)
        <input
          value={form.nameEn}
          onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Slogan
        <input
          value={form.slogan}
          onChange={(e) => setForm({ ...form, slogan: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Tagline
        <input
          value={form.tagline}
          onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        About text (footer)
        <textarea
          value={form.about}
          onChange={(e) => setForm({ ...form, about: e.target.value })}
          className="mt-1 min-h-24 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-zinc-400">
          Phone (call)
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
          />
        </label>
        <label className="block text-sm text-zinc-400">
          Phone (WhatsApp / Imo)
          <input
            value={form.phone2}
            onChange={(e) => setForm({ ...form, phone2: e.target.value })}
            className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
          />
        </label>
      </div>
      <label className="block text-sm text-zinc-400">
        Email
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Address
        <input
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Hours / contact note
        <input
          value={form.hours}
          onChange={(e) => setForm({ ...form, hours: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Facebook URL
        <input
          value={form.facebook}
          onChange={(e) => setForm({ ...form, facebook: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Home banner title
        <input
          value={form.homeBannerTitle}
          onChange={(e) => setForm({ ...form, homeBannerTitle: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Home banner button
        <input
          value={form.homeBannerCta}
          onChange={(e) => setForm({ ...form, homeBannerCta: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Header offer button
        <input
          value={form.headerOfferLabel}
          onChange={(e) => setForm({ ...form, headerOfferLabel: e.target.value })}
          className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3 text-zinc-100"
        />
      </label>
      <button type="submit" disabled={saving} className="rounded-xl bg-gold px-6 py-3 font-bold text-leaf-deep disabled:opacity-60">
        {saving ? 'Saving...' : 'Save website'}
      </button>
    </form>
  )
}
