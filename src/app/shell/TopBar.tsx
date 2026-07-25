import { Menu, Moon, Search, Settings as SettingsIcon, Sun } from 'lucide-react'
import { openCommandPalette, openSettingsDialog } from '@/ui-primitives'
import type { Settings } from '@/ontology'
import { BrandMark } from './BrandMark'

interface Props {
  settings: Settings
  onChangeSettings: (settings: Settings) => void
  onOpenNavigation: () => void
}

export function TopBar({ settings, onChangeSettings, onOpenNavigation }: Props) {
  const nextTheme =
    settings.theme === 'system'
      ? 'light'
      : settings.theme === 'light'
        ? 'dark'
        : 'system'

  return (
    <header className="topbar">
      <button
        type="button"
        className="icon-button navigation-trigger"
        onClick={onOpenNavigation}
        aria-label="Open navigation"
      >
        <Menu size={17} />
      </button>
      <div className="brand-lockup">
        <BrandMark />
        <span>Foco</span>
      </div>
      <button
        type="button"
        className="command-trigger"
        onClick={openCommandPalette}
        aria-label="Search or run a command"
      >
        <Search size={15} />
        <span>Search or run a command</span>
        <kbd>Ctrl K</kbd>
      </button>
      <div className="topbar-actions">
        <button
          type="button"
          className="icon-button"
          onClick={() => onChangeSettings({ ...settings, theme: nextTheme })}
          aria-label={`Theme: ${settings.theme}. Switch to ${nextTheme}`}
          title={`Theme: ${settings.theme}`}
        >
          {settings.theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={openSettingsDialog}
          aria-label="Open settings"
        >
          <SettingsIcon size={16} />
        </button>
      </div>
    </header>
  )
}
