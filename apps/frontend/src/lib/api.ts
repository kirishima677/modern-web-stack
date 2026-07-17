import { apiErrorResponseSchema } from '@modern-web-stack/shared'
import type { ZodType } from 'zod'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const request = async <T>(
  path: string,
  options: RequestInit,
  schema: ZodType<T>,
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  const payload: unknown = await response.json()

  if (!response.ok) {
    const errorPayload = apiErrorResponseSchema.safeParse(payload)
    throw new ApiError(
      response.status,
      errorPayload.success ? errorPayload.data.message : 'Request failed',
    )
  }

  return schema.parse(payload)
}
