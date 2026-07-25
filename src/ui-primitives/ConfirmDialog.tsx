import * as Dialog from '@radix-ui/react-dialog'
import { useId, useRef } from 'react'
import { create } from 'zustand'

interface ConfirmRequest {
  title: string
  body?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  resolve: (v: boolean) => void
}

interface ConfirmStore {
  current: ConfirmRequest | null
  open: (r: Omit<ConfirmRequest, 'resolve'>) => Promise<boolean>
  close: (v: boolean) => void
}

const useConfirmStore = create<ConfirmStore>((set, get) => ({
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

export const confirm = (opts: {
  title: string
  body?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}): Promise<boolean> => useConfirmStore.getState().open(opts)

export function ConfirmHost() {
  const current = useConfirmStore((s) => s.current)
  const close = useConfirmStore((s) => s.close)
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null)
  const titleId = useId()
  const descriptionId = useId()

  if (!current) return null

  const accent = current.danger
    ? 'bg-red-500 text-zinc-950 hover:bg-red-400'
    : 'bg-orange-500 text-zinc-950 hover:bg-orange-400'

  return (
    <Dialog.Root open onOpenChange={(open) => !open && close(false)}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          role="alertdialog"
          aria-labelledby={titleId}
          aria-describedby={current.body ? descriptionId : undefined}
          className="dialog-content"
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            cancelBtnRef.current?.focus()
          }}
        >
          <Dialog.Title id={titleId} className="dialog-title">
            {current.title}
          </Dialog.Title>
          {current.body && (
            <Dialog.Description id={descriptionId} className="dialog-description">
              {current.body}
            </Dialog.Description>
          )}
          <div className="dialog-actions">
            <button
              ref={cancelBtnRef}
              onClick={() => close(false)}
              className="button button-secondary"
            >
              {current.cancelLabel ?? 'Cancel'}
            </button>
            <button
              onClick={() => close(true)}
              className={`button ${accent}`}
            >
              {current.confirmLabel ?? 'OK'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
