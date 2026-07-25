import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/adapters', () => ({
  parseConversationMessages: vi.fn(async () => {
    throw new Error('Malformed conversation JSON at line 2')
  }),
  fetchToolResults: vi.fn(async () => new Map()),
}))

import { conversationDescriptor } from './conversation'

describe('conversationDescriptor', () => {
  it('renders parser failures instead of an empty-conversation state', async () => {
    const Editor = conversationDescriptor.Editor
    render(
      <Editor
        value={{
          sessionId: 'one',
          title: 'Broken',
          startTime: '',
          lastTime: '',
          turnCount: 0,
          projectDir: 'project',
          filePath: '/broken.jsonl',
        }}
        onChange={() => {}}
        ctx={{ knownAgents: [], knownCommands: [] }}
      />,
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Malformed conversation JSON at line 2',
    )
    expect(screen.queryByText('No messages found.')).not.toBeInTheDocument()
  })
})
