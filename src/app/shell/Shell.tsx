import { useEffect, useState } from 'react'
import { Group, Panel, Separator, type Layout } from 'react-resizable-panels'
import { X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { ListPane } from './ListPane'
import { EditPane } from './EditPane'
import { TopBar } from './TopBar'
import { StatusBar } from './StatusBar'
import { useStore } from '@/app/store'
import {
  CommandPalette,
  ConfirmHost,
  ContextMenuHost,
  PromptHost,
  ScanDialogHost,
  SettingsDialog,
} from '@/ui-primitives'
import { Toaster, toast } from 'sonner'
import { buildPaletteActions } from '@/app/palette'

const LAYOUT_KEY = 'foco-config-manager:workbench-layout'

const loadLayout = (): Layout | undefined => {
  try {
    const raw = localStorage.getItem(LAYOUT_KEY)
    return raw ? (JSON.parse(raw) as Layout) : undefined
  } catch (error) {
    console.warn('Could not restore workbench layout', error)
    return undefined
  }
}

const saveLayout = (layout: Layout): void => {
  try {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout))
  } catch (error) {
    console.warn('Could not persist workbench layout', error)
  }
}

export function Shell() {
  const bootstrap = useStore((s) => s.bootstrap)
  const dispose = useStore((s) => s.dispose)
  const ready = useStore((s) => s.ready)
  const lastError = useStore((s) => s.lastError)
  const addProject = useStore((s) => s.addProject)
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const selectedId = useStore((s) => s.selectedId)
  const [navigationOpen, setNavigationOpen] = useState(false)
  const [defaultLayout] = useState(loadLayout)
  useStore((s) => s.scope)
  useStore((s) => s.kind)
  useStore((s) => s.selectedId)
  useStore((s) => s.projects)
  useStore((s) => s.entities)

  useEffect(() => {
    void bootstrap()
    return dispose
  }, [bootstrap, dispose])

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      const resolved = settings.theme === 'system'
        ? (media.matches ? 'dark' : 'light')
        : settings.theme
      root.dataset.theme = settings.theme
      root.dataset.resolvedTheme = resolved
      root.style.colorScheme = resolved
    }
    applyTheme()
    media.addEventListener('change', applyTheme)
    return () => media.removeEventListener('change', applyTheme)
  }, [settings.theme])

  const actions = buildPaletteActions()

  if (!ready && !lastError) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
        Loading…
      </div>
    )
  }

  return (
    <div className={`app-shell ${selectedId ? 'has-selection' : ''}`}>
      <TopBar
        settings={settings}
        onChangeSettings={updateSettings}
        onOpenNavigation={() => setNavigationOpen(true)}
      />
      {lastError && (
        <div role="alert" className="error-banner">
          {lastError}
        </div>
      )}
      <main className="workbench">
        <Group
          id="foco-workbench"
          orientation="horizontal"
          className="workbench-group"
          defaultLayout={defaultLayout}
          resizeTargetMinimumSize={{ fine: 10, coarse: 28 }}
          onLayoutChanged={(layout, meta) => {
            if (!meta.isUserInteraction) return
            saveLayout(layout)
          }}
        >
          <Panel
            id="navigation"
            defaultSize="18%"
            minSize="190px"
            maxSize="320px"
            collapsible
            collapsedSize="0px"
            groupResizeBehavior="preserve-pixel-size"
          >
            <Sidebar />
          </Panel>
          <Separator id="navigation-separator" className="resize-separator" />
          <Panel
            id="items"
            defaultSize="24%"
            minSize="260px"
            maxSize="480px"
            collapsible
            collapsedSize="0px"
            groupResizeBehavior="preserve-pixel-size"
          >
            <ListPane />
          </Panel>
          <Separator id="items-separator" className="resize-separator" />
          <Panel id="editor" minSize="360px">
            <EditPane />
          </Panel>
        </Group>
      </main>
      <StatusBar />
      {navigationOpen && (
        <div className="navigation-drawer-layer" onClick={() => setNavigationOpen(false)}>
          <div className="navigation-drawer" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="icon-button drawer-close"
              onClick={() => setNavigationOpen(false)}
              aria-label="Close navigation"
            >
              <X size={17} />
            </button>
            <Sidebar />
          </div>
        </div>
      )}
      <CommandPalette actions={actions} />
      <ContextMenuHost />
      <PromptHost />
      <ConfirmHost />
      <ScanDialogHost
        onAdd={async (paths) => {
          for (const p of paths) await addProject(p)
          toast.success(`Added ${paths.length} project${paths.length === 1 ? '' : 's'}`)
        }}
      />
      <SettingsDialog
        settings={settings}
        onChange={updateSettings}
      />
      <Toaster theme={settings.theme} position="bottom-right" />
    </div>
  )
}
