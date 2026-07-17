import { z } from 'zod'

const nameSchema = z.string().trim().min(1, 'Name is required')
const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email address')
  .transform((value) => value.toLowerCase())

export const userSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const createUserInputSchema = z.object({
  name: nameSchema,
  email: emailSchema,
})

export const updateUserInputSchema = createUserInputSchema

export const healthResponseSchema = z.object({
  status: z.literal('ok'),
})

export const userResponseSchema = z.object({
  data: userSchema,
})

export const usersResponseSchema = z.object({
  data: z.array(userSchema),
})

export const deleteUserResponseSchema = z.object({
  data: z.object({
    id: z.string().min(1),
  }),
})

export const apiErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
})
