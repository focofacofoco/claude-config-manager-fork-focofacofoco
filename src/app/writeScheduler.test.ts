import { describe, expect, it, vi } from 'vitest'
import { WriteScheduler } from './writeScheduler'

describe('WriteScheduler', () => {
  it('keeps writes for the same id in different scope/kind keys independent', async () => {
    vi.useFakeTimers()
    const writes: string[] = []
    const scheduler = new WriteScheduler(350)

    scheduler.schedule('user::agent::same', async () => writes.push('agent'))
    scheduler.schedule('user::rule::same', async () => writes.push('rule'))
    await vi.advanceTimersByTimeAsync(350)

    expect(writes).toEqual(['agent', 'rule'])
    vi.useRealTimers()
  })

  it('replaces an earlier edit and flushes the latest write exactly once', async () => {
    vi.useFakeTimers()
    const first = vi.fn()
    const latest = vi.fn()
    const scheduler = new WriteScheduler(350)

    scheduler.schedule('user::agent::one', first)
    scheduler.schedule('user::agent::one', latest)
    await scheduler.flush()
    await vi.advanceTimersByTimeAsync(350)

    expect(first).not.toHaveBeenCalled()
    expect(latest).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })

  it('cancels pending entity writes and disposes without persisting', async () => {
    vi.useFakeTimers()
    const write = vi.fn()
    const scheduler = new WriteScheduler(350)

    scheduler.schedule('project:a::agent::one', write)
    scheduler.cancel('project:a::agent::one')
    scheduler.schedule('project:a::rule::two', write)
    scheduler.dispose()
    await vi.advanceTimersByTimeAsync(350)

    expect(write).not.toHaveBeenCalled()
    vi.useRealTimers()
  })
})
