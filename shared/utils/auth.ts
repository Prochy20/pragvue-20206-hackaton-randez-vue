import { z } from 'zod'

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string()
    .min(8, 'Password must have at least 8 characters')
    .max(200, 'Password can have at most 200 characters')
})

export type Credentials = z.infer<typeof credentialsSchema>

// Forgot-password flow without email: the server's NUXT_PASSWORD_RESET_KEY stands in for a reset link.
export const passwordResetSchema = credentialsSchema.extend({
  resetKey: z.string().trim().min(1, 'Enter the reset key')
})

export type PasswordReset = z.infer<typeof passwordResetSchema>
