import { index, integer, jsonb, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import type { Answer } from '../../shared/types/admin'
import type { DiffLine } from '../../shared/types/participant'
import type { HereFor } from '../../shared/utils/registration'
import type { Questionnaire } from '../../shared/utils/questionnaire'

const id = () => uuid().primaryKey().defaultRandom()
const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow()

export const users = pgTable('users', {
  id: id(),
  email: text().notNull().unique(),
  passwordHash: text().notNull(),
  createdAt: createdAt()
})

export const events = pgTable('events', {
  id: id(),
  slug: text().notNull().unique(),
  name: text().notNull(),
  ownerId: uuid().notNull().references(() => users.id, { onDelete: 'cascade' }),
  questionnaire: jsonb().$type<Questionnaire>().notNull(),
  createdAt: createdAt()
})

export const participants = pgTable('participants', {
  id: id(),
  eventId: uuid().notNull().references(() => events.id, { onDelete: 'cascade' }),
  token: text().notNull().unique(),
  // Registration order within the event, shown as #042 on the card.
  number: integer().notNull(),
  name: text().notNull(),
  role: text().notNull(),
  company: text(),
  hereFor: jsonb().$type<HereFor[]>().notNull(),
  answers: jsonb().$type<Answer[]>().notNull(),
  title: text(),
  tagline: text(),
  emoji: text(),
  specialMove: text(),
  weakness: text(),
  peerDependency: text(),
  dependencies: jsonb().$type<string[]>().notNull(),
  aiStatus: text().$type<'ok' | 'failed'>().notNull(),
  createdAt: createdAt()
}, table => [index().on(table.eventId), unique().on(table.eventId, table.number)])

export const rounds = pgTable('rounds', {
  id: id(),
  eventId: uuid().notNull().references(() => events.id, { onDelete: 'cascade' }),
  number: integer().notNull(),
  status: text().$type<'ok' | 'failed'>().notNull(),
  createdAt: createdAt()
}, table => [unique().on(table.eventId, table.number)])

export const pairs = pgTable('pairs', {
  id: id(),
  roundId: uuid().notNull().references(() => rounds.id, { onDelete: 'cascade' }),
  participantIds: jsonb().$type<string[]>().notNull(),
  reason: text().notNull(),
  diff: jsonb().$type<DiffLine[]>().notNull().default([]),
  icebreaker: text().notNull()
}, table => [index().on(table.roundId)])
