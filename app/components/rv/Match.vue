<script setup lang="ts">
const props = defineProps<{
  profile: PublicProfile
  match: PublicMatch
  profileTo: string
  // Terminal output of the fake `git commit`, shown instead of the CTA once clicked.
  commitHash: string | null
}>()

const emit = defineEmits<{
  commit: []
}>()

interface Member {
  removed: boolean
  first: string
  name: string
  title: string
  recognizeMe: string | null
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name

const members = computed<Member[]>(() => props.match.others.map(other => other.removed || !other.name
  ? { removed: true, first: 'removed', name: 'uninstalled', title: '(removed)', recognizeMe: null }
  : {
      removed: false,
      first: firstName(other.name),
      name: other.name,
      title: other.title ?? other.role ?? '—',
      recognizeMe: other.recognizeMe
    }))

const active = computed(() => members.value.filter(member => !member.removed))
const anyRemoved = computed(() => active.value.length < members.value.length)
const compact = computed(() => members.value.length > 1)

const diffCommand = computed(() =>
  ['$ diff you', ...members.value.map(member => kebab(member.first).split('-')[0] || 'them')].join(' '))
const metWho = computed(() => active.value.map(member => member.first.toLowerCase()).join(' & '))
</script>

<template>
  <p
    v-if="active.length"
    class="font-mono-rv text-xs font-medium text-rv-green"
  >
    ✓ installed friend@1.0.0
  </p>
  <p
    v-else
    class="font-mono-rv text-xs font-medium text-rv-muted"
  >
    <span class="text-rv-yellow">WARN</span> friend@1.0.0 was uninstalled
  </p>

  <h1 class="text-[30px] leading-[1.05] font-bold tracking-[-1px] text-balance">
    <template v-if="active.length">
      You + {{ active.map(member => member.first).join(' + ') }}<br>compile cleanly.
    </template>
    <template v-else>
      Your match<br>left.
    </template>
  </h1>

  <p
    v-if="anyRemoved"
    class="font-mono-rv text-xs text-rv-pink"
    role="status"
  >
    {{ active.length ? 'One of your matches left.' : 'Your match left.' }} Next round will fix that.
  </p>

  <div
    class="grid"
    :class="compact ? 'grid-cols-3 gap-2' : 'grid-cols-2 gap-2.5'"
  >
    <RvMiniCard
      tone="you"
      :initials="initials(profile.name)"
      :title="profile.title ?? profile.role"
      label="you"
      :compact="compact"
    />
    <RvMiniCard
      v-for="(member, i) in members"
      :key="i"
      :tone="member.removed ? 'removed' : 'match'"
      :initials="member.removed ? '?' : initials(member.name)"
      :title="member.title"
      :label="member.name.toLowerCase()"
      :compact="compact"
    />
  </div>

  <p class="text-[15px] leading-normal text-pretty text-rv-text-2">
    {{ match.reason }}
  </p>

  <div class="rounded-xl bg-rv-code px-3.5 py-3 font-mono-rv text-xs leading-[1.7]">
    <p class="text-rv-muted">
      {{ diffCommand }}
    </p>
    <p
      v-for="(line, i) in match.diff"
      :key="i"
      :class="line.sign === '+' ? 'text-rv-green' : 'text-rv-pink'"
    >
      {{ line.sign }} {{ line.text }}
    </p>
  </div>

  <template
    v-for="member in active"
    :key="member.name"
  >
    <p
      v-if="member.recognizeMe"
      class="font-mono-rv text-xs leading-normal text-rv-muted"
    >
      spot {{ member.first.toLowerCase() }} by: <span class="font-grotesk text-sm text-rv-text-2">{{ member.recognizeMe }}</span>
    </p>
  </template>

  <div class="mt-auto flex flex-col gap-1.5 rounded-[14px] bg-rv-pink p-4 text-rv-bg">
    <p class="font-mono-rv text-[11px] font-bold tracking-[1px]">
      // ICEBREAKER
    </p>
    <p class="text-[17px] leading-[1.35] font-semibold text-pretty">
      “{{ match.icebreaker }}”
    </p>
  </div>

  <template v-if="active.length">
    <div
      v-if="commitHash"
      class="animate-rv-fade-in rounded-xl bg-rv-code px-3.5 py-3 font-mono-rv text-xs leading-[1.7]"
      role="status"
    >
      <p class="text-rv-text">
        [main {{ commitHash }}] met {{ metWho }}
      </p>
      <p class="text-rv-green">
        {{ active.length }} {{ active.length === 1 ? 'friend' : 'friends' }} committed, 0 small talks deleted
      </p>
    </div>
    <RvButton
      v-else
      variant="outline"
      @click="emit('commit')"
    >
      git commit -m "met {{ metWho }}"
    </RvButton>
  </template>

  <p class="text-center font-mono-rv text-xs text-rv-muted">
    <NuxtLink
      :to="profileTo"
      class="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-rv-green"
    >
      cd ~/profile
    </NuxtLink>
  </p>
</template>
