import type { ReactNode } from 'react'

interface Props {
  title?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  children: ReactNode
}

export function Inspector({ title, subtitle, actions, children }: Props) {
  return (
    <div className="inspector">
      {(title || actions) && (
        // The header is its own container so we can switch between row and
        // column layout based on the *inspector* width (not the viewport).
        // At narrow widths we stack actions below the title/subtitle rather
        // than squeezing the title until it truncates.
        <header className="inspector-header @container">
          <div className="flex flex-col items-start gap-2 @[560px]:flex-row @[560px]:items-center @[560px]:justify-between">
            <div className="min-w-0 max-w-full">
              {title && <div className="text-sm font-medium truncate">{title}</div>}
              {subtitle && (
                <div className="text-xs text-zinc-500 truncate">{subtitle}</div>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div>
            )}
          </div>
        </header>
      )}
      <div className="inspector-body">{children}</div>
    </div>
  )
}
