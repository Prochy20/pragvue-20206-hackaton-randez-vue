<script setup lang="ts">
const props = defineProps<{
  groups: WallGroup[]
  roundNumber: number
}>()

const ROTATE_MS = 10_000
// Without rotation at most this many groups share one page.
const MAX_PER_PAGE = 8
const GAP = 24

// Pagination uses a fixed card size tier instead of measuring rendered cards:
// type scales with the viewport width (clamp + vw), so a card's minimum size is
// a fraction of window.innerWidth. The container (not the cards) is observed, so
// there is no feedback loop and long texts are line-clamped to fit the tier.
const box = ref<HTMLElement | null>(null)
const size = ref({ width: 0, height: 0, viewport: 1920 })

let observer: ResizeObserver | null = null
onMounted(() => {
  if (!box.value) return
  observer = new ResizeObserver(([entry]) => {
    if (!entry) return
    size.value = {
      width: entry.contentRect.width,
      height: entry.contentRect.height,
      viewport: window.innerWidth
    }
  })
  observer.observe(box.value)
})
onBeforeUnmount(() => observer?.disconnect())

// The reason takes whatever height the card has left, so its line clamp follows
// the room instead of a fixed count: short pages show the full text, dense ones
// still ellipsize. The wrapper's height comes from the grid row, not the text.
let reasonObserver: ResizeObserver | null = null

function fitReason(wrapper: HTMLElement, height: number) {
  const text = wrapper.firstElementChild as HTMLElement | null
  if (!text) return
  const lineHeight = Number.parseFloat(getComputedStyle(text).lineHeight)
  if (!lineHeight) return
  const lines = Math.floor((height + 1) / lineHeight)
  // No room for a whole line: hide it rather than show a sliced one.
  text.style.visibility = lines ? '' : 'hidden'
  text.style.setProperty('-webkit-line-clamp', String(Math.max(1, lines)))
}

function trackReason(el: unknown) {
  if (!(el instanceof HTMLElement)) return
  reasonObserver ??= new ResizeObserver((entries) => {
    for (const entry of entries) {
      const target = entry.target as HTMLElement
      // Pages re-render with fresh elements; a removed one reports a last
      // (zero) size, which is the moment to stop observing it.
      if (!target.isConnected) reasonObserver?.unobserve(target)
      else fitReason(target, entry.contentRect.height)
    }
  })
  // Observing an already observed element is a no-op.
  reasonObserver.observe(el)
}
onBeforeUnmount(() => reasonObserver?.disconnect())

const minCardWidth = computed(() => Math.max(300, size.value.viewport * 0.2))
const minCardHeight = computed(() => Math.max(260, size.value.viewport * 0.18))

const columns = computed(() => {
  // SSR / before the first measurement: a sensible projector default.
  if (!size.value.width) return Math.min(4, Math.max(1, props.groups.length))
  const fit = Math.floor((size.value.width + GAP) / (minCardWidth.value + GAP))
  return Math.min(4, Math.max(1, fit), Math.max(1, props.groups.length))
})

const rows = computed(() => {
  if (!size.value.height) return 2
  return Math.max(1, Math.floor((size.value.height + GAP) / (minCardHeight.value + GAP)))
})

const perPage = computed(() => Math.max(1, Math.min(MAX_PER_PAGE, columns.value * rows.value)))
const pageCount = computed(() => Math.max(1, Math.ceil(props.groups.length / perPage.value)))

const page = ref(0)
const visible = computed(() => props.groups.slice(page.value * perPage.value, (page.value + 1) * perPage.value))

// Rows actually used on this page; each row stays at most 1.5× the tier, the rest is centred.
const gridStyle = computed(() => {
  const used = Math.max(1, Math.ceil(visible.value.length / columns.value))
  const style: Record<string, string> = {
    gridTemplateColumns: `repeat(${columns.value}, minmax(0, 1fr))`,
    gap: `${GAP}px`
  }
  if (size.value.height) {
    const fill = (size.value.height - GAP * (used - 1)) / used
    style.gridTemplateRows = `repeat(${used}, ${Math.floor(Math.min(fill, minCardHeight.value * 1.5))}px)`
  }
  return style
})

// Polling hands over a new array every tick; only a content change resets the page.
const signature = computed(() => JSON.stringify([props.roundNumber, props.groups]))

let timer: ReturnType<typeof setInterval> | null = null
function restart() {
  if (timer) clearInterval(timer)
  timer = null
  if (import.meta.server || pageCount.value < 2) return
  timer = setInterval(() => {
    page.value = (page.value + 1) % pageCount.value
  }, ROTATE_MS)
}

watch(signature, () => {
  page.value = 0
  restart()
})
watch(pageCount, (count) => {
  if (page.value >= count) page.value = 0
  restart()
})
onMounted(restart)
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

// Trios get a third of the card per member: the avatar sits above the name and
// the title is left out, so the names fit and the reason keeps its room.
function isTrio(group: WallGroup) {
  return group.members.length > 2
}

function avatarText(member: WallMember) {
  if (member.removed || !member.name) return '?'
  return member.emoji || initials(member.name)
}
</script>

<template>
  <section
    class="flex h-full min-h-0 flex-col gap-4"
    aria-label="Matched groups"
  >
    <div
      ref="box"
      class="relative min-h-0 flex-1"
    >
      <div
        :key="`${signature}-${page}-${perPage}`"
        class="absolute inset-0 grid content-center"
        :style="gridStyle"
      >
        <article
          v-for="(group, i) in visible"
          :key="i"
          class="
            flex min-h-0 animate-rv-fade-in flex-col gap-[clamp(10px,0.8vw,18px)]
            overflow-hidden rounded-[18px] border border-rv-border bg-rv-surface
            p-[clamp(14px,1.1vw,24px)] [animation-duration:0.6s]
          "
          :style="{ animationDelay: `${i * 120}ms` }"
        >
          <div
            class="grid shrink-0 gap-[clamp(8px,0.6vw,14px)]"
            :class="isTrio(group) ? 'grid-cols-3' : 'grid-cols-2'"
          >
            <div
              v-for="(member, m) in group.members"
              :key="m"
              class="flex min-w-0"
              :class="isTrio(group)
                ? 'flex-col items-start gap-[clamp(4px,0.4vw,8px)]'
                : 'items-center gap-[clamp(8px,0.6vw,14px)]'"
            >
              <div
                class="flex shrink-0 items-center justify-center rounded-xl"
                :class="[
                  isTrio(group) ? 'size-[clamp(26px,2vw,44px)]' : 'size-[clamp(40px,3vw,64px)]',
                  member.removed
                    ? 'border border-dashed border-rv-border-2 font-mono-rv font-bold text-rv-muted'
                    : member.emoji
                      ? 'border border-rv-green bg-rv-surface-3 font-emoji'
                      : 'bg-rv-green font-mono-rv font-bold text-rv-bg',
                  isTrio(group)
                    ? member.emoji && !member.removed ? 'text-[clamp(15px,1.15vw,24px)]' : 'text-[clamp(11px,0.8vw,16px)]'
                    : member.removed
                      ? 'text-[clamp(16px,1.2vw,24px)]'
                      : member.emoji ? 'text-[clamp(22px,1.7vw,34px)]' : 'text-[clamp(15px,1.1vw,22px)]'
                ]"
                aria-hidden="true"
              >
                {{ avatarText(member) }}
              </div>
              <div
                class="min-w-0"
                :class="isTrio(group) && 'w-full'"
              >
                <p
                  class="line-clamp-2 leading-[1.15] font-bold"
                  :class="[
                    isTrio(group)
                      ? 'text-[clamp(14px,0.95vw,20px)] wrap-normal hyphens-none'
                      : 'text-[clamp(15px,1.05vw,22px)] break-words',
                    member.removed && 'text-rv-muted'
                  ]"
                >
                  {{ member.removed ? '(removed)' : member.name }}
                </p>
                <p
                  v-if="!member.removed && member.title && !isTrio(group)"
                  class="truncate font-mono-rv text-[clamp(11px,0.75vw,15px)] text-rv-muted"
                >
                  {{ member.title }}
                </p>
              </div>
            </div>
          </div>

          <div
            :ref="trackReason"
            class="min-h-0 flex-1 overflow-hidden"
          >
            <p class="line-clamp-3 text-[clamp(14px,0.95vw,20px)] leading-[1.35] text-pretty text-rv-text-2">
              {{ group.reason }}
            </p>
          </div>

          <div
            class="
              flex shrink-0 flex-col gap-1.5 rounded-[14px] bg-rv-pink
              p-[clamp(12px,0.9vw,20px)] text-rv-bg
            "
          >
            <p class="font-mono-rv text-[clamp(11px,0.7vw,14px)] font-bold tracking-[1px]">
              // ICEBREAKER
            </p>
            <p class="line-clamp-4 text-[clamp(16px,1.15vw,24px)] leading-[1.3] font-semibold text-pretty">
              “{{ group.icebreaker }}”
            </p>
          </div>
        </article>
      </div>
    </div>

    <p class="shrink-0 text-right font-mono-rv text-[clamp(13px,0.9vw,18px)] text-rv-muted">
      round {{ roundNumber }}<template v-if="pageCount > 1">
        · page {{ page + 1 }}/{{ pageCount }}
      </template>
    </p>
  </section>
</template>
