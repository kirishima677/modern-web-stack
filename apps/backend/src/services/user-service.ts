import { eq } from 'drizzle-orm'
import {
  createUserInputSchema,
  updateUserInputSchema,
  type CreateUserInput,
  type UpdateUserInput,
  type User,
} from '@modern-web-stack/shared'

import type { DatabaseClient } from '../db/client.js'
import { usersTable } from '../db/schema.js'
import { AppError } from '../errors.js'

export interface UserService {
  list(): Promise<User[]>
  getById(id: string): Promise<User | null>
  create(input: CreateUserInput): Promise<User>
  update(id: string, input: UpdateUserInput): Promise<User | null>
  remove(id: string): Promise<boolean>
}

const toUser = (row: typeof usersTable.$inferSelect): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
})

export const createDatabaseUserService = (db: DatabaseClient): UserService => ({
  async list() {
    const rows = await db
      .select()
      .from(usersTable)
      .orderBy(usersTable.createdAt)
    return rows.map(toUser)
  },
  async getById(id) {
    const row = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, id),
    })

    return row ? toUser(row) : null
  },
  async create(input) {
    const parsed = createUserInputSchema.parse(input)
    const now = new Date()
    const [row] = await db
      .insert(usersTable)
      .values({
        id: crypto.randomUUID(),
        name: parsed.name,
        email: parsed.email,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    if (!row) {
      throw new AppError(500, 'Failed to create user')
    }

    return toUser(row)
  },
  async update(id, input) {
    const parsed = updateUserInputSchema.parse(input)
    const [row] = await db
      .update(usersTable)
      .set({
        name: parsed.name,
        email: parsed.email,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, id))
      .returning()

    return row ? toUser(row) : null
  },
  async remove(id) {
    const deletedRows = await db
      .delete(usersTable)
      .where(eq(usersTable.id, id))
      .returning({ id: usersTable.id })
    return deletedRows.length > 0
  },
})
