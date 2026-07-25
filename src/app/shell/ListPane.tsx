import { useEffect, useMemo, useRef } from 'react'
import { useStore } from '@/app/store'
import { descriptorFor } from '@/ui-descriptors'
import { ColorDot, List, openContextMenu, prompt, confirm, type ContextMenuItem } from '@/ui-primitives'
import { kindSpecs, type Entity } from '@/ontology'
import { prefetchConversation } from '@/adapters'
import { copyMoveTargets } from './targets'
import { cn } from '@/ui-primitives/util'
import { canCreateKind, canDeleteEntity, canMoveEntity } from '@/app/policy'
import { Plus, Search, X } from 'lucide-react'

export function ListPane() {
  const kind = useStore((s) => s.kind)
  const scope = useStore((s) => s.scope)
  const projects = useStore((s) => s.projects)
  const entities = useStore((s) => (s.entities as any)[kind] as Entity<any>[])
  const selected = useStore((s) => s.selectedId)
  const setSelected = useStore((s) => s.setSelected)
  const search = useStore((s) => s.search)
  const setSearch = useStore((s) => s.setSearch)
  const createNew = useStore((s) => s.createNew)
  const deleteExisting = useStore((s) => s.deleteExisting)
  const copyToScope = useStore((s) => s.copyToScope)
  const moveToScope = useStore((s) => s.moveToScope)
  const createIn = useStore((s) => s.createIn)
  const home = useStore((s) => s.home)

  const descriptor = descriptorFor(kind)
  const spec = kindSpecs[kind]

  const tabs = descriptor.tabs ?? []
  const activeTabStore = useStore((s) => s.activeTab)
  const setActiveTab = useStore((s) => s.setActiveTab)
  const activeTabId = tabs.length > 0 ? (activeTabStore[kind] ?? tabs[0]!.id) : null
  const activeTab = tabs.find((t) => t.id === activeTabId) ?? null

  const items = useMemo(() => {
    const q = search.toLowerCase().trim()
    let filtered = entities
    if (activeTab) filtered = filtered.filter((e) => activeTab.predicate(e.value))
    if (q) filtered = filtered.filter((e) => spec.searchText(e.value).includes(q))
    return filtered.map((e) => ({
      id: e.id,
      label: descriptor.listLabel(e.value),
      sublabel: descriptor.listSublabel?.(e.value),
      badge: e.dirty ? <ColorDot color="orange" title="Unsaved changes" /> : undefined,
      error: !!e.error,
    }))
  }, [entities, search, descriptor, spec, activeTab])

  useEffect(() => {
    if (selected === null) return
    if (items.some((item) => item.id === selected)) return
    setSelected(items[0]?.id ?? null)
  }, [items, selected, setSelected])

  // Predictive prefetch: when the user hovers on a conversation item for a
  // beat, start parsing it in the background so the click feels instant.
  // 120ms distinguishes "mouse resting here" from "flew past".
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
  }, [])
  const handleHover = useMemo<((id: string) => void) | undefined>(() => {
    if (kind !== 'conversation') return undefined
    return (id: string) => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = setTimeout(() => {
        const entity = entities.find((e) => e.id === id)
        if (entity?.path) prefetchConversation(entity.path)
      }, 120)
    }
  }, [kind, entities])

  const handleNew = async () => {
    const input = await prompt(descriptor.newLabel, {
      placeholder: descriptor.newPromptLabel,
    })
    if (!input) return
    await createNew(kind, input, descriptor.newDefault(input))
  }

  const contextItemsFor = (entityId: string): ContextMenuItem[] => {
    const entity = entities.find((e) => e.id === entityId)
    if (!entity) return []
    const canScopeMove = canMoveEntity(entity)
    const canDelete = canDeleteEntity(entity)
    const targets = canScopeMove ? copyMoveTargets(entity, projects) : []
    const menu: ContextMenuItem[] = []

    const custom =
      descriptor.customActions?.(entity, {
        scope,
        projects,
        home,
        createIn,
        remove: deleteExisting,
      }) ?? []
    menu.push(...custom)

    if (targets.length > 0) {
      menu.push({
        label: 'Copy to…',
        submenu: targets.map((t) => ({
          label: t.name,
          onSelect: () => copyToScope(entity, t.scope),
        })),
      })
      menu.push({
        label: 'Move to…',
        submenu: targets.map((t) => ({
          label: t.name,
          onSelect: () => moveToScope(entity, t.scope),
        })),
      })
    }
    if (canDelete) {
      menu.push({
        label: 'Delete',
        destructive: true,
        onSelect: async () => {
          const approved = await confirm({
            title: `Delete ${String(descriptor.listLabel(entity.value))}?`,
            body: 'This removes the underlying local configuration.',
            confirmLabel: 'Delete',
            danger: true,
          })
          if (approved) await deleteExisting(entity)
        },
      })
    }
    return menu
  }

  return (
    <section className="list-pane" aria-label={spec.pluralLabel}>
      <header className="list-pane-header">
        <div className="list-title-row">
          <div>
            <h1>{spec.pluralLabel}</h1>
            <span>{items.length} visible</span>
          </div>
          {canCreateKind(kind, scope) && (
            <button
              type="button"
              onClick={handleNew}
              className="button button-primary compact"
              title={descriptor.newLabel}
            >
              <Plus size={14} />
              New
            </button>
          )}
        </div>
        <div className="search-field">
          <Search size={14} aria-hidden="true" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${spec.pluralLabel.toLowerCase()}…`}
            aria-label={`Search ${spec.pluralLabel.toLowerCase()}`}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              title="Clear search"
              className="icon-button compact"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </header>
      {tabs.length > 0 && (
        <div className="list-tabs" role="tablist" aria-label={`${spec.pluralLabel} views`}>
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={activeTabId === t.id}
              onClick={() => setActiveTab(kind, t.id)}
              className={cn(
                'text-xs px-3 py-1.5 transition-colors',
                activeTabId === t.id
                  ? 'text-zinc-100 border-b-2 border-orange-400 -mb-px'
                  : 'text-zinc-500 hover:text-zinc-300',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
      <div className="list-scroll" role="tabpanel">
        <List
          items={items}
          selectedId={selected}
          onSelect={setSelected}
          onHover={handleHover}
          onContextMenu={(id, e) => {
            setSelected(id)
            openContextMenu(e, contextItemsFor(id))
          }}
          empty={`No ${spec.pluralLabel.toLowerCase()} in this scope.`}
        />
      </div>
    </section>
  )
}
