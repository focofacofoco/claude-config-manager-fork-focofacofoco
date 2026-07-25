import { createRequire } from 'node:module'
import { expect, test } from '@playwright/test'

const require = createRequire(import.meta.url)
const axePath = require.resolve('axe-core/axe.min.js')

test('desktop workbench filters selection and protects destructive actions', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.getByText('Foco', { exact: true })).toBeVisible()
  await expect(page.getByRole('complementary', { name: 'Workspace navigation' })).toBeVisible()

  await page.getByRole('button', { name: /Agents/ }).click()
  await page.getByRole('button', { name: /^code-reviewer/i }).click()
  await page.getByRole('textbox', { name: 'Search agents' }).fill('oncall-triager')

  const filtered = page.getByRole('button', { name: /^oncall-triager/i })
  await expect(filtered).toBeVisible()
  await expect(
    page.getByTestId('editor').getByText('oncall-triager', { exact: true }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Delete' }).click()
  const dialog = page.getByRole('alertdialog', { name: 'Delete this item?' })
  await expect(dialog).toBeVisible()
  const cancel = dialog.getByRole('button', { name: 'Cancel' })
  await expect(cancel).toBeFocused()
  await cancel.press('Enter')

  await expect(dialog).toBeHidden()
  await expect(filtered).toBeVisible()

  await page.addScriptTag({ path: axePath })
  const violations = await page.evaluate(async () => {
    const result = await window.axe.run()
    return result.violations.map(({ id, impact, nodes }) => ({
      id,
      impact,
      count: nodes.length,
      targets: nodes.map((node) => node.target.join(' ')),
    }))
  })
  expect(violations).toEqual([])
})

test('compact layout supports list-detail navigation and the workspace drawer', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  await page.getByRole('button', { name: 'Back to list' }).click()
  await expect(page.getByRole('region', { name: 'Instructions' })).toBeVisible()
  await page.getByRole('button', { name: /\.claude\/CLAUDE\.md/i }).click()
  await expect(page.getByRole('button', { name: 'Back to list' })).toBeVisible()

  await page.getByRole('button', { name: 'Open navigation' }).click()
  await expect(page.getByRole('complementary', { name: 'Workspace navigation' })).toBeVisible()
  await page.getByRole('button', { name: 'Close navigation' }).click()
})

declare global {
  interface Window {
    axe: {
      run: () => Promise<{
        violations: Array<{
          id: string
          impact: string | null
          nodes: unknown[]
        }>
      }>
    }
  }
}
