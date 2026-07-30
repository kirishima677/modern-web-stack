import {
  createUserInputSchema,
  deleteUserResponseSchema,
  userResponseSchema,
  usersResponseSchema,
} from '@modern-web-stack/shared'
import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { createApp } from '../app.js'
import { loadEnv } from '../config.js'
import { createDatabaseClient } from '../db/client.js'
import { usersTable } from '../db/schema.js'
import { createDrizzleUserRepository } from '../repositories/user-repository.js'
import { createUserService } from '../services/user-service.js'

const input = createUserInputSchema.parse({
  name: 'Alice Example',
  email: 'alice@example.com',
})

describe('User API integration', () => {
  const databaseClient = createDatabaseClient(loadEnv().DATABASE_URL)
  const { db } = databaseClient
  let app!: FastifyInstance

  const createUser = async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/users',
      payload: input,
    })

    expect(response.statusCode).toBe(201)
    return userResponseSchema.parse(response.json()).data
  }

  beforeAll(async () => {
    const repository = createDrizzleUserRepository(db)
    const userService = createUserService(repository)
    app = await createApp({ userService, logger: false })
  })

  beforeEach(async () => {
    await db.delete(usersTable)
  })

  afterAll(async () => {
    await app.close()
    await databaseClient.close()
  })

  it('POST /api/users creates a user and persists it', async () => {
    const user = await createUser()

    expect(user).toMatchObject({
      name: input.name,
      email: input.email,
    })

    const row = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, user.id),
    })

    expect(row).toBeDefined()
    if (!row) throw new Error('Created user was not persisted')
    expect(row).toMatchObject({
      id: user.id,
      name: input.name,
      email: input.email,
    })
  })

  it('GET /api/users returns persisted users', async () => {
    const createdUser = await createUser()

    const response = await app.inject({ method: 'GET', url: '/api/users' })

    expect(response.statusCode).toBe(200)
    const users = usersResponseSchema.parse(response.json()).data
    expect(users).toContainEqual(createdUser)

    const rows = await db.select().from(usersTable)
    expect(rows).toHaveLength(1)
    const [row] = rows
    expect(row).toBeDefined()
    if (!row) throw new Error('Listed user was not persisted')
    expect(row).toMatchObject({
      id: createdUser.id,
      name: input.name,
      email: input.email,
    })
  })

  it('GET /api/users/:id returns the persisted user', async () => {
    const createdUser = await createUser()

    const response = await app.inject({
      method: 'GET',
      url: `/api/users/${createdUser.id}`,
    })

    expect(response.statusCode).toBe(200)
    const user = userResponseSchema.parse(response.json()).data
    expect(user).toEqual(createdUser)

    const row = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, createdUser.id),
    })
    expect(row).toBeDefined()
    if (!row) throw new Error('Requested user was not persisted')
    expect(row).toMatchObject({
      id: createdUser.id,
      name: input.name,
      email: input.email,
    })
  })

  it('PUT /api/users/:id updates the persisted user', async () => {
    const createdUser = await createUser()
    const update = createUserInputSchema.parse({
      name: 'Alice Updated',
      email: 'alice.updated@example.com',
    })

    const response = await app.inject({
      method: 'PUT',
      url: `/api/users/${createdUser.id}`,
      payload: update,
    })

    expect(response.statusCode).toBe(200)
    const user = userResponseSchema.parse(response.json()).data
    expect(user).toMatchObject({ id: createdUser.id, ...update })

    const row = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, createdUser.id),
    })
    expect(row).toBeDefined()
    if (!row) throw new Error('Updated user was not persisted')
    expect(row).toMatchObject({ id: createdUser.id, ...update })
  })

  it('DELETE /api/users/:id deletes the persisted user', async () => {
    const createdUser = await createUser()

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/users/${createdUser.id}`,
    })

    expect(response.statusCode).toBe(200)
    expect(deleteUserResponseSchema.parse(response.json()).data).toEqual({
      id: createdUser.id,
    })

    const row = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, createdUser.id),
    })
    expect(row).toBeUndefined()
  })
})
