import { createContext, useContext, useId, type ReactNode } from 'react'
import { cn } from './util'

interface Props {
  label: string
  hint?: string
  error?: string
  /**
   * `column` (default) — tiny uppercase label above the control; use for any
   * control that wants horizontal space (text inputs, textareas, array
   * editors, markdown).
   * `row` — regular-weight label on the left, control on the right; use only
   * for compact controls that don't stretch (Switch, short enum button group).
   */
  orientation?: 'column' | 'row'
  children: ReactNode
}

interface FieldA11y {
  controlId: string
  label: string
  descriptionId?: string
}

const FieldContext = createContext<FieldA11y | null>(null)

export const useFieldA11y = (): FieldA11y | null => useContext(FieldContext)

export function Field({ label, hint, error, orientation = 'column', children }: Props) {
  const id = useId()
  const controlId = `${id}-control`
  const labelId = `${id}-label`
  const descriptionId = hint || error ? `${id}-description` : undefined
  const content = (
    <FieldContext.Provider value={{ controlId, label, descriptionId }}>
      {children}
    </FieldContext.Provider>
  )

  if (orientation === 'row') {
    return (
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          {/* leading-none drops the line-height padding so the glyph's visual
              center aligns with the centered control next to it. */}
          <div id={labelId} className="text-sm text-zinc-200 leading-none">{label}</div>
          {hint && !error && (
            <div id={descriptionId} className="text-xs text-zinc-500 mt-1">{hint}</div>
          )}
          {error && <div id={descriptionId} className="text-xs text-red-400 mt-1">{error}</div>}
        </div>
        <div className="shrink-0">{content}</div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <label
        id={labelId}
        htmlFor={controlId}
        className={cn('block text-[11px] uppercase tracking-wide text-zinc-500')}
      >
        {label}
      </label>
      {content}
      {hint && !error && <div id={descriptionId} className="text-xs text-zinc-600">{hint}</div>}
      {error && <div id={descriptionId} className="text-xs text-red-400">{error}</div>}
    </div>
  )
}
