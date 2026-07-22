import type { ZodError } from 'zod'

export class AppError extends Error {
  readonly statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
  }
}

export class ValidationError extends Error {
  readonly statusCode = 400

  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class DuplicateEmailError extends Error {
  readonly statusCode = 409

  constructor(message = 'Email already exists') {
    super(message)
    this.name = 'DuplicateEmailError'
  }
}

export class UserNotFoundError extends Error {
  readonly statusCode = 404

  constructor(message = 'User not found') {
    super(message)
    this.name = 'UserNotFoundError'
  }
}

export const formatZodError = (error: ZodError): string =>
  error.issues.map((issue) => issue.message).join(', ')

export const isDatabaseConflictError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === '23505'
