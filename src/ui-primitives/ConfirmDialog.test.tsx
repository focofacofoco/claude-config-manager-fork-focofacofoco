import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ConfirmHost, confirm } from './ConfirmDialog'

describe('ConfirmHost', () => {
  it('does not turn Enter on the focused cancel button into confirmation', async () => {
    const user = userEvent.setup()
    render(<ConfirmHost />)

    const result = confirm({ title: 'Delete this item?', danger: true })
    const cancel = await screen.findByRole('button', { name: 'Cancel' })
    cancel.focus()
    await user.keyboard('{Enter}')

    await expect(result).resolves.toBe(false)
  })

  it('exposes an accessible modal dialog', async () => {
    render(<ConfirmHost />)

    const result = confirm({ title: 'Overwrite item?', body: 'This cannot be undone.' })

    expect(await screen.findByRole('alertdialog', { name: 'Overwrite item?' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await result
  })
})
