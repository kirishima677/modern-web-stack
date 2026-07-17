import type { z } from 'zod'

import type {
  createUserInputSchema,
  updateUserInputSchema,
  userSchema,
} from './schemas/user.js'

export {
  apiErrorResponseSchema,
  createUserInputSchema,
  deleteUserResponseSchema,
  healthResponseSchema,
  updateUserInputSchema,
  userResponseSchema,
  userSchema,
  usersResponseSchema,
} from './schemas/user.js'

export type { ApiErrorResponse, ApiSuccessResponse } from './types/api.js'
export type User = z.infer<typeof userSchema>
export type CreateUserInput = z.infer<typeof createUserInputSchema>
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>
