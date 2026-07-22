import type {
  CreateUserInput,
  UpdateUserInput,
  User as SharedUser,
} from '@modern-web-stack/shared'

import { User } from '../domain/user.js'
import { DuplicateEmailError, UserNotFoundError } from '../errors.js'
import type { UserRepository } from '../repositories/user-repository.js'

export interface UserService {
  list(): Promise<SharedUser[]>
  getById(id: string): Promise<SharedUser>
  create(input: CreateUserInput): Promise<SharedUser>
  update(id: string, input: UpdateUserInput): Promise<SharedUser>
  remove(id: string): Promise<void>
}

const toSharedUser = (user: User): SharedUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
})

export const createUserService = (repository: UserRepository): UserService => ({
  async list() {
    const users = await repository.findAll()
    return users.map(toSharedUser)
  },

  async getById(id) {
    const user = await repository.findById(id)
    if (!user) {
      throw new UserNotFoundError()
    }
    return toSharedUser(user)
  },

  async create(input) {
    const existing = await repository.findByEmail(input.email.trim().toLowerCase())
    if (existing) {
      throw new DuplicateEmailError()
    }

    const now = new Date()
    const user = User.create({
      id: crypto.randomUUID(),
      name: input.name,
      email: input.email,
      createdAt: now,
      updatedAt: now,
    })

    const saved = await repository.insert(user)
    return toSharedUser(saved)
  },

  async update(id, input) {
    const existing = await repository.findById(id)
    if (!existing) {
      throw new UserNotFoundError()
    }

    const updated = existing.changeName(input.name).changeEmail(input.email)
    const saved = await repository.update(updated)
    return toSharedUser(saved)
  },

  async remove(id) {
    const existing = await repository.findById(id)
    if (!existing) {
      throw new UserNotFoundError()
    }
    await repository.delete(id)
  },
})
