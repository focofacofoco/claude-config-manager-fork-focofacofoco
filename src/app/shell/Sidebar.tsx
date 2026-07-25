import {
  Bot,
  Brain,
  Command,
  FileText,
  MessagesSquare,
  Plus,
  Plug,
  ScanSearch,
  Server,
  Settings2,
  ShieldCheck,
  Sparkles,
  Store,
  Webhook,
} from 'lucide-react'
import { allKindsForScope, kindSpecs, type Kind } from '@/ontology'
import { useStore } from '@/app/store'
import { cn, openScanDialog, openSettingsDialog, prompt } from '@/ui-primitives'
import { pickDirectory } from '@/adapters/dialog'
import { fs } from '@/adapters'
import { toast } from 'sonner'

const KIND_GROUPS: Array<{ label: string; kinds: Kind[] }> = [
  { label: 'Context', kinds: ['claudemd', 'memory', 'conversation'] },
  { label: 'Automations', kinds: ['agent', 'command', 'skill', 'rule', 'hook'] },
  { label: 'Integrations', kinds: ['mcp', 'plugin', 'marketplace'] },
]

export function Sidebar() {
  const scope = useStore((s) => s.scope)
  const projects = useStore((s) => s.projects)
  const kind = useStore((s) => s.kind)
  const home = useStore((s) => s.home)
  const setScope = useStore((s) => s.setScope)
  const setKind = useStore((s) => s.setKind)
  const addProject = useStore((s) => s.addProject)
  const removeProject = useStore((s) => s.removeProject)
  const supportedKinds = allKindsForScope(scope)

  const handleAdd = async () => {
    const path = await pickDirectory()
    if (!path) return
    const name = await prompt('Project name (optional)', {
      initialValue: '',
      placeholder: path.split(/[\\/]/).pop() ?? '',
    })
    await addProject(path, name || undefined)
  }

  const handleScan = async () => {
    const root = await pickDirectory()
    if (!root) return
    await openScanDialog(root, (candidate) => fs.scanForProjects(candidate))
    toast.message('Scanning…', { description: root })
  }

  return (
    <aside className="sidebar" aria-label="Workspace navigation">
      <div className="sidebar-scroll">
        <div className="sidebar-section-heading">
          <span>Workspaces</span>
          <span className="sidebar-heading-actions">
            <button
              type="button"
              onClick={handleScan}
              className="icon-button compact"
              title="Scan a folder for projects"
              aria-label="Scan a folder for projects"
            >
              <ScanSearch size={14} />
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="icon-button compact"
              title="Add a project"
              aria-label="Add a project"
            >
              <Plus size={15} />
            </button>
          </span>
        </div>
        <nav aria-label="Workspaces">
          <ScopeItem
            name="Global"
            path={home ? `${home.replace(/\\/g, '/')}/.claude` : undefined}
            active={scope.type === 'user'}
            onSelect={() => setScope({ type: 'user' })}
          />
          {projects.map((project) => (
            <ScopeItem
              key={project.id}
              name={project.name}
              path={project.path}
              muted={!project.exists}
              active={scope.type === 'project' && scope.projectId === project.id}
              onSelect={() => setScope({ type: 'project', projectId: project.id })}
              onRemove={() => removeProject(project)}
            />
          ))}
          {projects.length === 0 && <div className="sidebar-empty">No projects yet.</div>}
        </nav>

        <nav className="kind-navigation" aria-label="Configuration">
          {KIND_GROUPS.map((group) => {
            const kinds = group.kinds.filter((candidate) =>
              supportedKinds.includes(candidate),
            )
            if (kinds.length === 0) return null
            return (
              <div key={group.label} className="kind-group">
                <div className="sidebar-section-heading">{group.label}</div>
                {kinds.map((candidate) => (
                  <KindButton
                    key={candidate}
                    kind={candidate}
                    active={kind === candidate}
                    onClick={() => setKind(candidate)}
                  />
                ))}
              </div>
            )
          })}
        </nav>
      </div>

      <button type="button" className="sidebar-settings" onClick={openSettingsDialog}>
        <Settings2 size={15} />
        <span>Settings</span>
        <span className="sidebar-local">
          <ShieldCheck size={12} />
          local
        </span>
      </button>
    </aside>
  )
}

function ScopeItem({
  name,
  path,
  active,
  muted,
  onSelect,
  onRemove,
}: {
  name: string
  path?: string
  active: boolean
  muted?: boolean
  onSelect: () => void
  onRemove?: () => void
}) {
  return (
    <div className={cn('scope-item group', active && 'is-active')}>
      <button
        type="button"
        onClick={onSelect}
        className="scope-button"
        aria-current={active ? 'page' : undefined}
      >
        <span className={cn('scope-name', muted && 'line-through text-zinc-500')}>
          {name}
        </span>
        {path && <span className="scope-path">{path}</span>}
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onRemove()
          }}
          className="scope-remove"
          title="Remove from list"
          aria-label={`Remove ${name} from list`}
        >
          ×
        </button>
      )}
    </div>
  )
}

function KindButton({
  kind,
  active,
  onClick,
}: {
  kind: Kind
  active: boolean
  onClick: () => void
}) {
  const count = useStore((s) => (s.entities as any)[kind].length as number)
  const loading = useStore((s) => s.loadingKinds.has(kind))
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn('kind-button', active && 'is-active')}
    >
      <span className="kind-label">
        <KindIcon kind={kind} />
        {kindSpecs[kind].pluralLabel}
      </span>
      {loading ? <Spinner /> : <span className="kind-count">{count}</span>}
    </button>
  )
}

function KindIcon({ kind }: { kind: Kind }) {
  const props = { size: 14, 'aria-hidden': true as const }
  switch (kind) {
    case 'claudemd': return <FileText {...props} />
    case 'memory': return <Brain {...props} />
    case 'agent': return <Bot {...props} />
    case 'command': return <Command {...props} />
    case 'skill': return <Sparkles {...props} />
    case 'rule': return <ShieldCheck {...props} />
    case 'hook': return <Webhook {...props} />
    case 'mcp': return <Server {...props} />
    case 'plugin': return <Plug {...props} />
    case 'marketplace': return <Store {...props} />
    case 'conversation': return <MessagesSquare {...props} />
  }
}

function Spinner() {
  return (
    <span
      className="spinner"
      role="status"
      aria-label="Loading"
    />
  )
}
