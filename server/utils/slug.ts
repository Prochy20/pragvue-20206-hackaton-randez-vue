import { eq } from 'drizzle-orm'
import { events } from '~~/server/db/schema'

const SUFFIX_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789'

export function slugify(name: string) {
  const slug = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40)
    .replace(/^-+|-+$/g, '')
  return slug || 'event'
}

function randomSuffix() {
  return Array.from({ length: 4 }, () => SUFFIX_CHARS[Math.floor(Math.random() * SUFFIX_CHARS.length)]).join('')
}

// Base slug if free, otherwise base + random 4-char suffix until free.
export async function uniqueSlug(name: string) {
  const db = useDb()
  const base = slugify(name)
  let slug = base
  for (;;) {
    const taken = await db.query.events.findFirst({ columns: { id: true }, where: eq(events.slug, slug) })
    if (!taken) return slug
    slug = `${base}-${randomSuffix()}`
  }
}
