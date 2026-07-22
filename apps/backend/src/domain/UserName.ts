import { z } from 'zod'

import { ValidationError } from '../errors.js'

const nameRule = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(50, 'Name must be 50 characters or less')

export class UserName {
  readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  static create(raw: string): UserName {
    const result = nameRule.safeParse(raw)
    if (!result.success) {
      throw new ValidationError(result.error.issues[0]?.message ?? 'Invalid name')
    }
    return new UserName(result.data)
  }
}
