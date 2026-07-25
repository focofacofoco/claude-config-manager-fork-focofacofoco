import { describe, expect, it } from 'vitest'
import { Marketplace } from './marketplace'

describe('Marketplace', () => {
  it('accepts legacy Claude registry source objects', () => {
    expect(
      Marketplace.parse({
        name: 'official',
        source: { repo: 'anthropic/claude-plugin-marketplace' },
      }).source,
    ).toEqual({ repo: 'anthropic/claude-plugin-marketplace' })
  })
})
