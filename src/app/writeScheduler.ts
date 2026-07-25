type PendingWrite = {
  timer: ReturnType<typeof setTimeout>
  run: () => Promise<unknown>
}

export class WriteScheduler {
  private readonly writes = new Map<string, PendingWrite>()

  constructor(private readonly delay: number) {}

  schedule(key: string, run: () => Promise<unknown>): void {
    this.cancel(key)
    const timer = setTimeout(async () => {
      const pending = this.writes.get(key)
      if (!pending || pending.run !== run) return
      this.writes.delete(key)
      await run()
    }, this.delay)
    this.writes.set(key, { timer, run })
  }

  cancel(key: string): void {
    const pending = this.writes.get(key)
    if (!pending) return
    clearTimeout(pending.timer)
    this.writes.delete(key)
  }

  cancelWhere(predicate: (key: string) => boolean): void {
    for (const key of this.writes.keys()) {
      if (predicate(key)) this.cancel(key)
    }
  }

  async flush(): Promise<void> {
    const pending = [...this.writes.values()]
    this.writes.clear()
    for (const write of pending) clearTimeout(write.timer)
    await Promise.all(pending.map((write) => write.run()))
  }

  dispose(): void {
    for (const pending of this.writes.values()) clearTimeout(pending.timer)
    this.writes.clear()
  }
}
