import { z } from 'zod'

export const MAX_QUESTIONS = 15
export const MAX_OPTIONS = 6

export const questionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['text', 'choice']),
  label: z.string().trim()
    .min(3, 'Question must have at least 3 characters')
    .max(200, 'Question can have at most 200 characters'),
  options: z.array(z.string().trim()
    .min(1, 'Options can\'t be empty')
    .max(60, 'Options can have at most 60 characters'))
    .min(2, 'Add at least 2 options')
    .max(MAX_OPTIONS, `At most ${MAX_OPTIONS} options`)
    .optional(),
  required: z.boolean(),
  placeholder: z.string().trim().max(100, 'Placeholder can have at most 100 characters').optional(),
  recognizeMe: z.boolean().optional()
}).superRefine((question, ctx) => {
  if (question.type === 'choice' && !question.options) {
    ctx.addIssue({ code: 'custom', path: ['options'], message: 'Add at least 2 options' })
  }
  if (question.type === 'text' && question.options) {
    ctx.addIssue({ code: 'custom', path: ['options'], message: 'Text questions have no options' })
  }
  if (question.type === 'choice' && question.recognizeMe) {
    ctx.addIssue({ code: 'custom', path: ['recognizeMe'], message: 'Only text questions can be shown with the match' })
  }
})

export const questionnaireSchema = z.array(questionSchema)
  .min(1, 'Add at least one question')
  .max(MAX_QUESTIONS, `At most ${MAX_QUESTIONS} questions`)
  .superRefine((questions, ctx) => {
    if (questions.filter(q => q.recognizeMe).length > 1) {
      ctx.addIssue({ code: 'custom', message: 'Only one question can be shown with the match' })
    }
    if (new Set(questions.map(q => q.id)).size !== questions.length) {
      ctx.addIssue({ code: 'custom', message: 'Question ids must be unique' })
    }
  })

export const createEventSchema = z.object({
  name: z.string().trim()
    .min(3, 'Name must have at least 3 characters')
    .max(80, 'Name can have at most 80 characters')
})

export type Question = z.infer<typeof questionSchema>
export type Questionnaire = z.infer<typeof questionnaireSchema>
export type CreateEventInput = z.infer<typeof createEventSchema>
