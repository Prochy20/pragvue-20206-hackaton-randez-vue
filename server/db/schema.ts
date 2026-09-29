import { index, integer, jsonb, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import type { Answer } from '../../shared/types/admin'
import type { Questionnaire } from '../../shared/utils/questionnaire'

const id = () => uuid().primaryKey().defaultRandom()
const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow()

export const events = pgTable('events', {
  id: id(),
  slug: text().notNull().unique(),
  name: text().notNull(),
  adminKey: text().notNull(),
  questionnaire: jsonb().$type<Questionnaire>().notNull(),
  createdAt: createdAt()
})

export const participants = pgTable('participants', {
  id: id(),
  eventId: uuid().notNull().references(() => events.id, { onDelete: 'cascade' }),
  token: text().notNull().unique(),
  name: text().notNull(),
  answers: jsonb().$type<Answer[]>().notNull(),
  title: text(),
  tagline: text(),
  emoji: text(),
  aiStatus: text().$type<'ok' | 'failed'>().notNull(),
  createdAt: createdAt()
}, table => [index().on(table.eventId)])

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
  icebreaker: text().notNull()
}, table => [index().on(table.roundId)])
