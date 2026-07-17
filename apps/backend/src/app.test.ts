import type {
  CreateUserInput,
  UpdateUserInput,
  User,
} from '@modern-web-stack/shared'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApp } from './app.js'
import type { UserService } from './services/user-service.js'

const createMockUserService = (): UserService => {
  const users = new Map<string, User>([
    [
      'user-1',
      {
        id: 'user-1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        createdAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
        updatedAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
      },
    ],
  ])

  return {
    list: vi.fn(() => Promise.resolve(Array.from(users.values()))),
    getById: vi.fn((id: string) => Promise.resolve(users.get(id) ?? null)),
    create: vi.fn((input: CreateUserInput) =>
      Promise.resolve({
        id: 'user-2',
        ...input,
        createdAt: new Date('2024-01-02T00:00:00.000Z').toISOString(),
        updatedAt: new Date('2024-01-02T00:00:00.000Z').toISOString(),
      }),
    ),
    update: vi.fn((id: string, input: UpdateUserInput) =>
      Promise.resolve(
        users.has(id)
          ? {
              id,
              ...input,
              createdAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
              updatedAt: new Date('2024-01-03T00:00:00.000Z').toISOString(),
            }
          : null,
      ),
    ),
    remove: vi.fn((id: string) => Promise.resolve(users.delete(id))),
  }
}

describe('createApp', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns health status', async () => {
    const app = await createApp({
      userService: createMockUserService(),
      logger: false,
    })

    const response = await app.inject({ method: 'GET', url: '/api/health' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ status: 'ok' })

    await app.close()
  })

  it('returns 400 for invalid user payload', async () => {
    const app = await createApp({
      userService: createMockUserService(),
      logger: false,
    })

    const response = await app.inject({
      method: 'POST',
      url: '/api/users',
      payload: { name: '', email: 'invalid-email' },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toMatchObject({
      error: 'AppError',
    })

    await app.close()
  })

  it('returns 404 when a user does not exist', async () => {
    const app = await createApp({
      userService: createMockUserService(),
      logger: false,
    })

    const response = await app.inject({
      method: 'GET',
      url: '/api/users/missing-user',
    })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toEqual({
      error: 'AppError',
      message: 'User not found',
    })

    await app.close()
  })
})
