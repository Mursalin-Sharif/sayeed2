import { useState, type FormEvent } from 'react'
import { useConfirm } from '@/components/admin/ConfirmDialog'
import { AdminUploadField } from '@/components/admin/AdminUploadField'
import { useStore } from '@/context/StoreContext'
import type { LandingMedia } from '@/lib/types'
import { uid } from '@/lib/utils'

function youtubeId(url: string) {
  const embed = url.match(/embed\/([a-zA-Z0-9_-]+)/)
  if (embed) return embed[1]
  const watch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/)
  if (watch) return watch[1]
  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
  if (short) return short[1]
  return null
}

const empty = {
  type: 'image' as LandingMedia['type'],
  url: '',
  title: '',
  caption: '',
  sortOrder: 1,
  active: true,
}

export function AdminMediaPage() {
  const { media, saveMedia, deleteMedia } = useStore()
  const confirm = useConfirm()
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')

  function resetForm() {
    setForm({ ...empty, sortOrder: media.length + 1 })
    setEditingId(null)
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setNotice('')
    try {
      await saveMedia({ id: editingId ?? uid('media'), ...form })
      setNotice(editingId ? 'Media updated.' : 'Media saved.')
      resetForm()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(item: LandingMedia) {
    if (!(await confirm(`Delete ${item.title || 'this file'}? This cannot be undone.`))) return
    await deleteMedia(item.id)
    if (editingId === item.id) resetForm()
    setNotice('Media deleted.')
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        <h1 className="font-display text-3xl text-gold">Landing media</h1>
        <p className="mt-1 text-zinc-400">Add, edit or remove images and videos on the offer page</p>
        {notice ? <p className="mt-2 text-sm font-semibold text-emerald-400">{notice}</p> : null}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {media
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((item) => (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                {item.type === 'video' ? (
                  <div className="aspect-video bg-black">
                    {youtubeId(item.url) ? (
                      <iframe
                        className="size-full"
                        src={`https://www.youtube.com/embed/${youtubeId(item.url)}`}
                        title={item.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video src={item.url} controls className="size-full object-cover" />
                    )}
                  </div>
                ) : (
                  <img src={item.url} alt={item.title} className="aspect-video w-full object-cover" />
                )}
                <div className="p-3">
                  <p className="font-semibold">{item.title || 'Untitled'}</p>
                  <p className="text-xs text-zinc-400">{item.caption}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                    <button
                      type="button"
                      className="text-gold"
                      onClick={() => {
                        setNotice('')
                        setEditingId(item.id)
                        setForm({
                          type: item.type,
                          url: item.url,
                          title: item.title,
                          caption: item.caption,
                          sortOrder: item.sortOrder,
                          active: item.active,
                        })
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-gold"
                      onClick={() => void saveMedia({ ...item, active: !item.active })}
                    >
                      {item.active ? 'Hide' : 'Show'}
                    </button>
                    <button type="button" className="text-red-400" onClick={() => void onDelete(item)}>
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="font-semibold">{editingId ? 'Edit media' : 'New media'}</h2>
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
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          Visible on offer page
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-xl bg-gold py-2 font-bold text-leaf-deep disabled:opacity-60"
          >
            {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
          </button>
          {editingId ? (
            <button type="button" onClick={resetForm} className="rounded-xl bg-white/10 px-3">
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </div>
  )
}
