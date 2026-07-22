import { eq } from 'drizzle-orm'

import type { DatabaseClient } from '../db/client.js'
import { usersTable } from '../db/schema.js'
import { User } from '../domain/user.js'

export interface UserRepository {
  findAll(): Promise<User[]>
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  insert(user: User): Promise<User>
  update(user: User): Promise<User>
  delete(id: string): Promise<void>
}

const rowToUser = (row: typeof usersTable.$inferSelect): User =>
  User.reconstruct({
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })

export const createDrizzleUserRepository = (db: DatabaseClient): UserRepository => ({
  async findAll() {
    const rows = await db.select().from(usersTable).orderBy(usersTable.createdAt)
    return rows.map(rowToUser)
  },

  async findById(id) {
    const row = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, id),
    })
    return row ? rowToUser(row) : null
  },

  async findByEmail(email) {
    const row = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    })
    return row ? rowToUser(row) : null
  },

  async insert(user) {
    const [row] = await db
      .insert(usersTable)
      .values({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .returning()

    if (!row) {
      throw new Error('Failed to insert user')
    }

    return rowToUser(row)
  },

  async update(user) {
    const [row] = await db
      .update(usersTable)
      .set({
        name: user.name,
        email: user.email,
        updatedAt: user.updatedAt,
      })
      .where(eq(usersTable.id, user.id))
      .returning()

    if (!row) {
      throw new Error('Failed to update user')
    }

    return rowToUser(row)
  },

  async delete(id) {
    await db.delete(usersTable).where(eq(usersTable.id, id))
  },
})
