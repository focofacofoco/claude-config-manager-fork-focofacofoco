import { CheckCircle2, CircleDotDashed, ShieldCheck } from 'lucide-react'
import { useStore } from '@/app/store'

export function StatusBar() {
  const scope = useStore((s) => s.scope)
  const projects = useStore((s) => s.projects)
  const dirty = useStore((s) =>
    Object.values(s.entities).flat().filter((entity) => entity.dirty).length,
  )
  const project =
    scope.type === 'project'
      ? projects.find((candidate) => candidate.id === scope.projectId)
      : null

  return (
    <footer className="statusbar" aria-label="Workspace status">
      <span>{project?.name ?? 'Global'}</span>
      <span className="statusbar-spacer" />
      <span className="status-item">
        {dirty > 0 ? <CircleDotDashed size={13} /> : <CheckCircle2 size={13} />}
        {dirty > 0 ? `Saving ${dirty} change${dirty === 1 ? '' : 's'}…` : 'Saved locally'}
      </span>
      <span className="status-item status-network">
        <ShieldCheck size={13} />
        Local-first
      </span>
    </footer>
  )
}
