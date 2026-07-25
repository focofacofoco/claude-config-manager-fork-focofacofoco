import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MarkdownView } from './MarkdownView'

const { openExternal } = vi.hoisted(() => ({ openExternal: vi.fn() }))

vi.mock('@/adapters', () => ({ fs: { openExternal } }))

describe('MarkdownView local-only behavior', () => {
  it('blocks passive remote images and opens remote links only after a click', async () => {
    const user = userEvent.setup()
    render(
      <MarkdownView
        value={'![tracker](https://example.com/pixel.png)\n\n[Docs](https://example.com/docs)'}
      />,
    )

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('Remote image blocked: tracker')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Docs' }))
    expect(openExternal).toHaveBeenCalledWith('https://example.com/docs')
  })
})
