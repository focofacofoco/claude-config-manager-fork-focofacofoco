import type { ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { create } from 'zustand'
import type { Settings } from '@/ontology'
import { Field } from './Field'
import { cn } from './util'
import { version as appVersion } from '../../package.json'

interface SettingsDialogState {
  open: boolean
  toggle: () => void
  show: () => void
  close: () => void
}

const useSettingsDialog = create<SettingsDialogState>((set) => ({
  open: false,
  toggle: () => set((s) => ({ open: !s.open })),
  show: () => set({ open: true }),
  close: () => set({ open: false }),
}))

export const openSettingsDialog = () => useSettingsDialog.getState().show()

interface Props {
  settings: Settings
  onChange: (next: Settings) => void
}

export function SettingsDialog({ settings, onChange }: Props) {
  const { open, close } = useSettingsDialog()
  if (!open) return null

  return (
    <Dialog.Root open onOpenChange={(next) => !next && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="settings-dialog" aria-describedby={undefined}>
        <header className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <Dialog.Title className="text-sm">Settings</Dialog.Title>
          <Dialog.Close className="icon-button compact" aria-label="Close settings">
            ×
          </Dialog.Close>
        </header>
        <div className="flex-1 overflow-auto px-5 py-4 space-y-8">
          <Section title="Editor" description="Defaults for the markdown editor.">
            <Field
              orientation="row"
              label="Markdown default mode"
              hint="Which view to show when opening markdown content."
            >
              <ModeToggle
                value={settings.markdownDefaultMode}
                onChange={(v) => onChange({ ...settings, markdownDefaultMode: v })}
              />
            </Field>
          </Section>
          <Section title="Appearance" description="Choose a theme or follow the operating system.">
            <Field orientation="row" label="Theme">
              <ThemeToggle
                value={settings.theme}
                onChange={(theme) => onChange({ ...settings, theme })}
              />
            </Field>
          </Section>
          <Section title="About">
            <div className="text-xs text-zinc-500 space-y-1 font-mono">
              <div>Foco Config Manager</div>
              <div>v{appVersion}</div>
              <div>Local-first. Explicit plugin operations may use the network.</div>
            </div>
          </Section>
        </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-medium text-zinc-100">{title}</h2>
        {description && (
          <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function ModeToggle({
  value,
  onChange,
}: {
  value: 'edit' | 'read'
  onChange: (v: 'edit' | 'read') => void
}) {
  return (
    <div className="inline-flex rounded border border-zinc-800 bg-zinc-900/40 overflow-hidden">
      {(['edit', 'read'] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={cn(
            'text-xs px-3 py-1 capitalize transition-colors',
            value === mode
              ? 'bg-zinc-800 text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-200',
          )}
        >
          {mode}
        </button>
      ))}
    </div>
  )
}

function ThemeToggle({
  value,
  onChange,
}: {
  value: Settings['theme']
  onChange: (theme: Settings['theme']) => void
}) {
  return (
    <div className="segmented-control" aria-label="Theme">
      {(['system', 'light', 'dark'] as const).map((theme) => (
        <button
          key={theme}
          type="button"
          aria-pressed={value === theme}
          onClick={() => onChange(theme)}
          className={cn(value === theme && 'is-active')}
        >
          {theme}
        </button>
      ))}
    </div>
  )
}
