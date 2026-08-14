import { useState, type FormEvent } from 'react'
import { AdminUploadField } from '@/components/admin/AdminUploadField'
import { useStore } from '@/context/StoreContext'
import type { LandingMedia } from '@/lib/types'
import { uid } from '@/lib/utils'

export function AdminMediaPage() {
  const { media, saveMedia, deleteMedia } = useStore()
  const [form, setForm] = useState<Omit<LandingMedia, 'id'>>({
    type: 'image',
    url: '',
    title: '',
    caption: '',
    sortOrder: media.length + 1,
    active: true,
  })

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    await saveMedia({ id: uid('media'), ...form })
    setForm({ type: 'image', url: '', title: '', caption: '', sortOrder: media.length + 2, active: true })
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        <h1 className="font-display text-3xl text-gold">Landing media</h1>
        <p className="mt-1 text-zinc-400">Add or remove images and videos on the offer page</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {media
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((item) => (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                {item.type === 'video' ? (
                  <div className="aspect-video bg-black text-center text-sm leading-[12rem] text-zinc-400">Video</div>
                ) : (
                  <img src={item.url} alt={item.title} className="aspect-video w-full object-cover" />
                )}
                <div className="p-3">
                  <p className="font-semibold">{item.title || 'Untitled'}</p>
                  <p className="text-xs text-zinc-400">{item.caption}</p>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <button
                      type="button"
                      className="text-gold"
                      onClick={() => void saveMedia({ ...item, active: !item.active })}
                    >
                      {item.active ? 'Hide' : 'Show'}
                    </button>
                    <button type="button" className="text-red-400" onClick={() => void deleteMedia(item.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="font-semibold">New media</h2>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value === 'video' ? 'video' : 'image' })}
          className="w-full rounded-xl bg-black/30 px-3 py-2"
        >
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
        <AdminUploadField
          label="File"
          value={form.url}
          onChange={(url) => {
            const isVideo =
              url.includes('youtube') ||
              url.includes('youtu.be') ||
              url.includes('.mp4') ||
              url.startsWith('data:video')
            setForm({ ...form, url, type: isVideo ? 'video' : form.type })
          }}
          accept="image/*,video/*"
          urlPlaceholder="Or paste image/video URL or YouTube embed"
          required
        />
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-xl bg-black/30 px-3 py-2"
        />
        <input
          placeholder="Caption"
          value={form.caption}
          onChange={(e) => setForm({ ...form, caption: e.target.value })}
          className="w-full rounded-xl bg-black/30 px-3 py-2"
        />
        <input
          type="number"
          placeholder="Sort order"
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
          className="w-full rounded-xl bg-black/30 px-3 py-2"
        />
        <button type="submit" className="w-full rounded-xl bg-gold py-2 font-bold text-leaf-deep">
          Add
        </button>
      </form>
    </div>
  )
}
