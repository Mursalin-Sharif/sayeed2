import { useEffect, useState, type FormEvent } from 'react'
import { useStore } from '@/context/StoreContext'

export function AdminLandingPage() {
  const { landing, saveLanding, products } = useStore()
  const [form, setForm] = useState(landing)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    setForm(landing)
  }, [landing])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setNotice('')
    try {
      await saveLanding({
        ...form,
        packageItems: form.packageItems.map((item) => item.trim()).filter(Boolean),
        whyItems: form.whyItems.map((item) => item.trim()).filter(Boolean),
      })
      setNotice('Landing page saved.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Save failed')
    } finally {
      setSaving(false)
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
