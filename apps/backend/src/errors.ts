import type { ZodError } from 'zod'

export class AppError extends Error {
  readonly statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
  }
}

export const formatZodError = (error: ZodError): string =>
  error.issues.map((issue) => issue.message).join(', ')

export const isDatabaseConflictError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === '23505'
