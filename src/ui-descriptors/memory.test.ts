import { describe, expect, it, vi } from 'vitest'
import type { Entity } from '@/ontology'
import { memoryDescriptor } from './memory'

const memory = {
  name: 'Stay focused',
  type: 'feedback' as const,
  description: 'Prefer direct work',
  body: 'Finish the job.',
}

const entity = {
  id: 'memory:stay-focused',
  kind: 'memory',
  scope: { type: 'user' },
  path: '/memory.md',
  value: memory,
  origin: memory,
  raw: '',
} satisfies Entity<typeof memory>

describe('memory conversion', () => {
  it('keeps the source when rule creation is cancelled or fails', async () => {
    const remove = vi.fn()
    const actions = memoryDescriptor.customActions?.(entity, {
      scope: entity.scope,
      projects: [],
      home: '/home',
      createIn: vi.fn(async () => false),
      remove,
    })

    await actions?.[0]?.onSelect?.()
    expect(remove).not.toHaveBeenCalled()
  })

  it('removes the memory only after the rule was created', async () => {
    const events: string[] = []
    const actions = memoryDescriptor.customActions?.(entity, {
      scope: entity.scope,
      projects: [],
      home: '/home',
      createIn: vi.fn(async () => {
        events.push('create')
        return true
      }),
      remove: vi.fn(async () => {
        events.push('remove')
      }),
    })

    await actions?.[0]?.onSelect?.()
    expect(events).toEqual(['create', 'remove'])
  })
})
