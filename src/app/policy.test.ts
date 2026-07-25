import { describe, expect, it } from 'vitest'
import { canCreateKind, canDeleteEntity, canMoveEntity } from './policy'

describe('entity action policy', () => {
  it('respects scope and kind creation capabilities', () => {
    expect(canCreateKind('agent', { type: 'user' })).toBe(true)
    expect(canCreateKind('memory', { type: 'user' })).toBe(false)
    expect(canCreateKind('memory', { type: 'project', projectId: 'p' })).toBe(true)
    expect(canCreateKind('plugin', { type: 'user' })).toBe(false)
  })

  it('keeps conversations movable but not deletable', () => {
    const entity = {
      id: 'conversation:one',
      kind: 'conversation' as const,
      scope: { type: 'user' as const },
      path: '/one.jsonl',
      value: { sessionId: 'one' },
      origin: { sessionId: 'one' },
      raw: '',
    }

    expect(canDeleteEntity(entity)).toBe(false)
    expect(canMoveEntity(entity)).toBe(true)
  })
})
