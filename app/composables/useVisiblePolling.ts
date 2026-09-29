// Calls `tick` every `intervalMs` while `enabled` is true and the tab is visible.
// Coming back to a visible tab ticks right away. Overlapping ticks are skipped.
export function useVisiblePolling(tick: () => Promise<void>, intervalMs: number, enabled: Ref<boolean>) {
  let timer: ReturnType<typeof setInterval> | undefined
  let inFlight = false

  async function run() {
    if (inFlight || !enabled.value || document.hidden) return
    inFlight = true
    try {
      await tick()
    } finally {
      inFlight = false
    }
  }

  function onVisibility() {
    if (!document.hidden) run()
  }

  onMounted(() => {
    timer = setInterval(run, intervalMs)
    document.addEventListener('visibilitychange', onVisibility)
  })

  onBeforeUnmount(() => {
    clearInterval(timer)
    document.removeEventListener('visibilitychange', onVisibility)
  })
}
