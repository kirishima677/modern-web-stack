import type {
  CreateUserInput,
  UpdateUserInput,
  User,
} from '@modern-web-stack/shared'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApp } from './app.js'
import {
  DuplicateEmailError,
  UserNotFoundError,
} from './errors.js'
import type { UserService } from './services/user-service.js'

const BASE_USER: User = {
  id: 'user-1',
  name: 'Jane Doe',
  email: 'jane@example.com',
  createdAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
  updatedAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
}

const createMockUserService = (): UserService => {
  const users = new Map<string, User>([['user-1', BASE_USER]])

  return {
    list: vi.fn(() => Promise.resolve(Array.from(users.values()))),
    getById: vi.fn((id: string) => {
      const user = users.get(id)
      if (!user) throw new UserNotFoundError()
      return Promise.resolve(user)
    }),
    create: vi.fn((input: CreateUserInput) =>
      Promise.resolve({
        id: 'user-2',
        ...input,
        createdAt: new Date('2024-01-02T00:00:00.000Z').toISOString(),
        updatedAt: new Date('2024-01-02T00:00:00.000Z').toISOString(),
      }),
    ),
    update: vi.fn((id: string, input: UpdateUserInput) => {
      if (!users.has(id)) throw new UserNotFoundError()
      return Promise.resolve({
        id,
        ...input,
        createdAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
        updatedAt: new Date('2024-01-03T00:00:00.000Z').toISOString(),
      })
    }),
    remove: vi.fn((id: string) => {
      if (!users.delete(id)) throw new UserNotFoundError()
      return Promise.resolve()
    }),
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
      error: 'ValidationError',
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
      error: 'UserNotFoundError',
      message: 'User not found',
    })

    await app.close()
  })

  it('returns 400 for an empty JSON body on delete requests', async () => {
    const app = await createApp({
      userService: createMockUserService(),
      logger: false,
    })

    const response = await app.inject({
      method: 'DELETE',
      url: '/api/users/user-1',
      headers: {
        'content-type': 'application/json',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toEqual({
      error: 'FastifyError',
      message: "Body cannot be empty when content-type is set to 'application/json'",
    })

    await app.close()
  })

  // --- 正常系 ---

  it('creates a user successfully (201)', async () => {
    const app = await createApp({
      userService: createMockUserService(),
      logger: false,
    })

    const response = await app.inject({
      method: 'POST',
      url: '/api/users',
      payload: { name: 'Alice', email: 'alice@example.com' },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      data: { id: 'user-2', name: 'Alice', email: 'alice@example.com' },
    })

    await app.close()
  })

  it('updates a user successfully (200)', async () => {
    const app = await createApp({
      userService: createMockUserService(),
      logger: false,
    })

    const response = await app.inject({
      method: 'PUT',
      url: '/api/users/user-1',
      payload: { name: 'Jane Updated', email: 'jane@example.com' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      data: { id: 'user-1', name: 'Jane Updated', email: 'jane@example.com' },
    })

    await app.close()
  })

  // --- 異常系 ---

  it('returns 400 when name is empty', async () => {
    const app = await createApp({
      userService: createMockUserService(),
      logger: false,
    })

    const response = await app.inject({
      method: 'POST',
      url: '/api/users',
      payload: { name: '', email: 'valid@example.com' },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toMatchObject({
      error: 'ValidationError',
      message: expect.stringContaining('Name') as string,
    })

    await app.close()
  })

  it('returns 400 when email format is invalid', async () => {
    const app = await createApp({
      userService: createMockUserService(),
      logger: false,
    })

    const response = await app.inject({
      method: 'POST',
      url: '/api/users',
      payload: { name: 'Alice', email: 'not-an-email' },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toMatchObject({
      error: 'ValidationError',
    })

    await app.close()
  })

  it('returns 409 when email is duplicated', async () => {
    const mockService = createMockUserService()
    vi.spyOn(mockService, 'create').mockRejectedValue(new DuplicateEmailError())

    const app = await createApp({ userService: mockService, logger: false })

    const response = await app.inject({
      method: 'POST',
      url: '/api/users',
      payload: { name: 'Bob', email: 'jane@example.com' },
    })

    expect(response.statusCode).toBe(409)
    expect(response.json()).toEqual({
      error: 'DuplicateEmailError',
      message: 'Email already exists',
    })

    await app.close()
  })

  it('returns 404 when updating a non-existent user', async () => {
    const app = await createApp({
      userService: createMockUserService(),
      logger: false,
    })

    const response = await app.inject({
      method: 'PUT',
      url: '/api/users/no-such-user',
      payload: { name: 'Ghost', email: 'ghost@example.com' },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toEqual({
      error: 'UserNotFoundError',
      message: 'User not found',
    })

    await app.close()
  })

  it('returns 404 when deleting a non-existent user', async () => {
    const app = await createApp({
      userService: createMockUserService(),
      logger: false,
    })

    const response = await app.inject({
      method: 'DELETE',
      url: '/api/users/no-such-user',
    })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toEqual({
      error: 'UserNotFoundError',
      message: 'User not found',
    })

    await app.close()
  })
})
