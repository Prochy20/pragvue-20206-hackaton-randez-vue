// Small presentation helpers for the Rendez-Vue participant screens.

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const letters = parts.length > 1 ? [parts[0]![0], parts.at(-1)![0]] : [...(parts[0] ?? '?')].slice(0, 2)
  return letters.join('').toUpperCase()
}

export function kebab(value: string) {
  return value.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function hashString(value: string) {
  let hash = 0
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  }
  return hash
}

// Deterministic per participant, so a reload never changes the card.
export function rarity(token: string) {
  const roll = hashString(token) % 10
  return roll < 6 ? 'COMMON' : roll < 9 ? 'RARE' : 'LEGENDARY'
}

export function cardNumber(number: number) {
  return `#${String(number).padStart(3, '0')}`
}

export function packageJson(profile: PublicProfile) {
  const [first = 'someone', ...rest] = kebab(profile.name).split('-')
  const version = (dep: string) => {
    const h = hashString(dep)
    return h % 3 === 0 ? '*' : `^${(h % 5) + 1}.${h % 10}.0`
  }
  return {
    name: `@${first}/${rest.join('-') || 'dev'}`,
    version: `1.0.0-${kebab(profile.role).slice(0, 24) || 'human'}`,
    description: profile.tagline ?? '',
    dependencies: Object.fromEntries(profile.dependencies.map(dep => [dep, version(dep)])),
    peerDependencies: profile.peerDependency ? { [profile.peerDependency]: '*' } : {}
  }
}

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
