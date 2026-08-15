import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

type ConfirmFn = (message: string) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const resolver = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((msg: string) => {
    setMessage(msg)
    setOpen(true)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  function close(value: boolean) {
    setOpen(false)
    resolver.current?.(value)
    resolver.current = null
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {open ? (
        <div className="fixed inset-0 z-[2000] grid place-items-center bg-black/65 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#18241f] p-5 text-zinc-100 shadow-2xl">
            <p className="text-sm leading-relaxed">{message}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => close(false)}
                className="rounded-xl bg-white/10 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider')
  return ctx
}
