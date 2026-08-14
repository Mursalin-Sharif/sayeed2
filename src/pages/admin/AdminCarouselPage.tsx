import { useState, type FormEvent } from 'react'
import { AdminUploadField } from '@/components/admin/AdminUploadField'
import { useStore } from '@/context/StoreContext'
import type { CarouselSlide } from '@/lib/types'
import { uid } from '@/lib/utils'

const empty = {
  image: '',
  title: '',
  subtitle: '',
  ctaText: 'Order now',
  ctaLink: '/offer',
  sortOrder: 1,
  active: true,
}

export function AdminCarouselPage() {
  const { slides, saveSlide, deleteSlide } = useStore()
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<string | null>(null)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const slide: CarouselSlide = {
      id: editingId ?? uid('slide'),
      ...form,
    }
    await saveSlide(slide)
    setForm(empty)
    setEditingId(null)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        <h1 className="font-display text-3xl text-gold">Home carousel</h1>
        <div className="mt-6 space-y-3">
          {slides
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((slide) => (
              <article key={slide.id} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <img src={slide.image} alt="" className="h-20 w-28 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="font-semibold">{slide.title}</p>
                  <p className="text-xs text-zinc-400">{slide.subtitle}</p>
                  <div className="mt-2 flex gap-3 text-sm">
                    <button
                      type="button"
                      className="text-gold"
                      onClick={() => {
                        setEditingId(slide.id)
                        setForm({
                          image: slide.image,
                          title: slide.title,
                          subtitle: slide.subtitle,
                          ctaText: slide.ctaText,
                          ctaLink: slide.ctaLink,
                          sortOrder: slide.sortOrder,
                          active: slide.active,
                        })
                      }}
                    >
                      Edit
                    </button>
                    <button type="button" className="text-red-400" onClick={() => void deleteSlide(slide.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="font-semibold">{editingId ? 'Edit slide' : 'New slide'}</h2>
        <AdminUploadField
          label="Slide image"
          value={form.image}
          onChange={(image) => setForm({ ...form, image })}
          required
        />
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-xl bg-black/30 px-3 py-2"
          required
        />
        <input
          placeholder="Subtitle"
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          className="w-full rounded-xl bg-black/30 px-3 py-2"
        />
        <input
          placeholder="Button text"
          value={form.ctaText}
          onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
          className="w-full rounded-xl bg-black/30 px-3 py-2"
        />
        <input
          placeholder="Button link"
          value={form.ctaLink}
          onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
          className="w-full rounded-xl bg-black/30 px-3 py-2"
        />
        <input
          type="number"
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
          className="w-full rounded-xl bg-black/30 px-3 py-2"
        />
        <button type="submit" className="w-full rounded-xl bg-gold py-2 font-bold text-leaf-deep">
          Save
        </button>
      </form>
    </div>
  )
}
