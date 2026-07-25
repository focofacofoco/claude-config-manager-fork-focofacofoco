import { useEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { create } from 'zustand'

interface PromptRequest {
  title: string
  placeholder?: string
  initialValue?: string
  resolve: (v: string | null) => void
}

interface PromptStore {
  current: PromptRequest | null
  open: (r: Omit<PromptRequest, 'resolve'>) => Promise<string | null>
  close: (v: string | null) => void
}

const usePromptStore = create<PromptStore>((set, get) => ({
  current: null,
  open: (r) =>
    new Promise((resolve) => {
      set({ current: { ...r, resolve } })
    }),
  close: (v) => {
    const r = get().current
    if (r) r.resolve(v)
    set({ current: null })
  },
}))

export const prompt = (title: string, opts?: { placeholder?: string; initialValue?: string }) =>
  usePromptStore.getState().open({ title, ...opts })

export function PromptHost() {
  const current = usePromptStore((s) => s.current)
  const close = usePromptStore((s) => s.close)
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setValue(current?.initialValue ?? '')
  }, [current])

  if (!current) return null

  return (
    <Dialog.Root open onOpenChange={(open) => !open && close(null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="dialog-content"
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            inputRef.current?.focus()
          }}
        >
        <Dialog.Title className="dialog-title">{current.title}</Dialog.Title>
        <div className="p-4">
          <input
            ref={inputRef}
            aria-label={current.title}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') close(value)
              if (e.key === 'Escape') close(null)
            }}
            placeholder={current.placeholder}
            className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 outline-none focus:border-orange-400"
          />
        </div>
        <div className="px-4 py-3 border-t border-zinc-800 flex justify-end gap-2">
          <button
            onClick={() => close(null)}
            className="button button-secondary"
          >
            Cancel
          </button>
          <button
            onClick={() => close(value)}
            className="button button-primary"
          >
            OK
          </button>
        </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
