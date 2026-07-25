import { beforeEach, describe, expect, it, vi } from 'vitest'

const { files, readJsonOrNull, writeJson } = vi.hoisted(() => {
  const files = new Map<string, unknown>()
  return {
    files,
    readJsonOrNull: vi.fn(async (path: string) => structuredClone(files.get(path) ?? null)),
    writeJson: vi.fn(async (path: string, value: unknown) => {
      files.set(path, structuredClone(value))
    }),
  }
})

vi.mock('@/adapters', () => ({
  fs: {
    pathExists: vi.fn(async () => true),
    writeJson,
  },
  join: (...parts: string[]) => parts.join('/'),
  readJsonOrNull,
}))

import { addManualProject, loadProjects } from './projects'

describe('manual project names', () => {
  beforeEach(() => {
    files.clear()
    files.set('C:/Users/me/.claude.json', { projects: {} })
    readJsonOrNull.mockClear()
    writeJson.mockClear()
  })

  it('persists and restores the name supplied by the user', async () => {
    await addManualProject('C:/Users/me', 'D:/work/alpha', 'My Alpha')
    const projects = await loadProjects('C:/Users/me')

    expect(writeJson).toHaveBeenCalledWith(
      'C:/Users/me/.config/foco-config-manager/projects.json',
      { 'D:/work/alpha': 'My Alpha' },
    )
    expect(projects[0]?.name).toBe('My Alpha')
  })

  it('falls back to the directory name when no custom name was supplied', async () => {
    await addManualProject('C:/Users/me', 'D:/work/plain-project')

    await expect(loadProjects('C:/Users/me')).resolves.toMatchObject([
      { name: 'plain-project', path: 'D:/work/plain-project' },
    ])
  })
})
