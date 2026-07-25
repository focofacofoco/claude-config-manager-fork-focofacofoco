import { kindSpecs, kindSupportsScope, type Entity, type Kind, type Scope } from '@/ontology'
import { descriptorFor } from '@/ui-descriptors'

export const canCreateKind = (kind: Kind, scope: Scope): boolean => {
  const spec = kindSpecs[kind]
  return (
    kindSupportsScope(kind, scope) &&
    !spec.readOnly &&
    !spec.noCreate
  )
}

export const canDeleteEntity = (entity: Entity<any>): boolean => {
  const spec = kindSpecs[entity.kind]
  if (spec.readOnly) return false
  return descriptorFor(entity.kind).canDelete?.(entity.value) ?? true
}

export const canMoveEntity = (entity: Entity<any>): boolean => {
  const spec = kindSpecs[entity.kind]
  return !spec.readOnly || Boolean(spec.allowScopeMove)
}
