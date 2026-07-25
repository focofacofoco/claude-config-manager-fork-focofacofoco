import { beforeEach, describe, expect, it, vi } from 'vitest'

const { readText } = vi.hoisted(() => ({ readText: vi.fn() }))

vi.mock('./fs', async () => {
  const actual = await vi.importActual<typeof import('./fs.demo')>('./fs.demo')
  return {
    ...actual,
    fs: { ...actual.fs, readText },
  }
})

vi.mock('@/registry', () => ({
  getConversationMeta: () => null,
  setConversationMeta: vi.fn(),
  getCachedConversation: () => null,
  setCachedConversation: vi.fn(),
  getPendingConversation: () => null,
  setPendingConversation: vi.fn(),
  clearPendingConversation: vi.fn(),
  getCachedToolResults: () => null,
  setCachedToolResults: vi.fn(),
  getPendingToolResults: () => null,
  setPendingToolResults: vi.fn(),
  clearPendingToolResults: vi.fn(),
}))

import { parseConversationMessages } from './conversationAdapter'

describe('parseConversationMessages', () => {
  beforeEach(() => readText.mockReset())

  it('surfaces malformed JSONL with the failing line number', async () => {
    readText.mockResolvedValue(
      [
        JSON.stringify({
          type: 'user',
          uuid: 'one',
          timestamp: '2026-01-01T00:00:00Z',
          message: { role: 'user', content: [{ type: 'text', text: 'Hello' }] },
        }),
        '{broken',
      ].join('\n'),
    )

    await expect(parseConversationMessages('/conversation.jsonl')).rejects.toThrow(
      'line 2',
    )
  })
})
