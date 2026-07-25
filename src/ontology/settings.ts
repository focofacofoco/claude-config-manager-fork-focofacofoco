import { z } from 'zod'

export const Settings = z.object({
  markdownDefaultMode: z.enum(['edit', 'read']).default('edit'),
  theme: z.enum(['system', 'light', 'dark']).default('system'),
  /** Plugin ids (`<name>@<marketplace>`) the user has flagged for an upcoming update. */
  markedPlugins: z.array(z.string()).default([]),
})
export type Settings = z.infer<typeof Settings>

export const defaultSettings = (): Settings => Settings.parse({})
