import { z } from 'zod'

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string()
    .min(8, 'Password must have at least 8 characters')
    .max(200, 'Password can have at most 200 characters')
})

export type Credentials = z.infer<typeof credentialsSchema>
