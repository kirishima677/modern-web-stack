import { z } from 'zod'

import { ValidationError } from '../errors.js'

const emailRule = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email address')
  .transform((v) => v.toLowerCase())

export class EmailAddress {
  readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  static create(raw: string): EmailAddress {
    const result = emailRule.safeParse(raw)
    if (!result.success) {
      throw new ValidationError(result.error.issues[0]?.message ?? 'Invalid email')
    }
    return new EmailAddress(result.data)
  }
}
