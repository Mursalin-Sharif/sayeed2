import { useStore } from '@/context/StoreContext'
import { confirmDelete, formatDate } from '@/lib/utils'

export function AdminMessagesPage() {
  const { messages, markMessageRead, deleteMessage } = useStore()
  const list = messages ?? []

  return (
    <div>
      <h1 className="font-display text-3xl text-gold">Inbox</h1>
      <p className="mt-1 text-zinc-400">Messages from the contact form · {list.length}</p>
      <div className="mt-6 space-y-3">
        {list.map((item) => (
          <article
            key={item.id}
            className={`rounded-2xl border p-4 ${item.read ? 'border-white/10 bg-white/5' : 'border-gold/40 bg-gold/10'}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold">{item.name}</p>
                <p className="text-sm text-zinc-400">
                  {item.phone}
                  {item.email ? ` · ${item.email}` : ''}
                </p>
                <p className="text-xs text-zinc-500">{formatDate(item.createdAt)}</p>
              </div>
              <div className="flex gap-3 text-sm">
                {!item.read && (
                  <button type="button" className="text-gold" onClick={() => void markMessageRead(item.id)}>
                    Mark as read
                  </button>
                )}
                <button
                  type="button"
                  className="text-red-400"
                  onClick={() => {
                    if (!confirmDelete(item.name)) return
                    void deleteMessage(item.id)
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed">{item.message}</p>
          </article>
        ))}
        {!list.length && <p className="py-10 text-center text-zinc-500">No messages</p>}
      </div>
    </div>
  )
}
