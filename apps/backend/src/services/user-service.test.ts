import { afterEach, describe, expect, it, vi } from 'vitest'

import { User } from '../domain/user.js'
import { DuplicateEmailError, UserNotFoundError } from '../errors.js'
import { createUserService } from './user-service.js'

const baseUser = User.reconstruct({
	id: 'user-1',
	name: 'Alice',
	email: 'alice@example.com',
	createdAt: new Date('2024-01-01T00:00:00.000Z'),
	updatedAt: new Date('2024-01-01T00:00:00.000Z'),
})

const createRepositoryMock = () => {
	return {
		findAll: vi.fn<() => Promise<User[]>>(),
		findById: vi.fn<(id: string) => Promise<User | null>>(),
		findByEmail: vi.fn<(email: string) => Promise<User | null>>(),
		insert: vi.fn<(user: User) => Promise<User>>(),
		update: vi.fn<(user: User) => Promise<User>>(),
		delete: vi.fn<(id: string) => Promise<void>>(),
	}
}

describe('createUserService', () => {
	afterEach(() => {
		vi.restoreAllMocks()
		vi.useRealTimers()
	})

	describe('list', () => {
		it('ユーザー一覧を SharedUser 形式で返す', async () => {
			const repository = createRepositoryMock()
			repository.findAll.mockResolvedValue([baseUser])
			const service = createUserService(repository)

			const result = await service.list()

			expect(repository.findAll).toHaveBeenCalledTimes(1)
			expect(result).toEqual([
				{
					id: 'user-1',
					name: 'Alice',
					email: 'alice@example.com',
					createdAt: '2024-01-01T00:00:00.000Z',
					updatedAt: '2024-01-01T00:00:00.000Z',
				},
			])
		})
	})

	describe('getById', () => {
		it('存在する ID のユーザーを返す', async () => {
			const repository = createRepositoryMock()
			repository.findById.mockResolvedValue(baseUser)
			const service = createUserService(repository)

			const result = await service.getById('user-1')

			expect(repository.findById).toHaveBeenCalledWith('user-1')
			expect(result).toEqual({
				id: 'user-1',
				name: 'Alice',
				email: 'alice@example.com',
				createdAt: '2024-01-01T00:00:00.000Z',
				updatedAt: '2024-01-01T00:00:00.000Z',
			})
		})

		it('存在しない ID の場合は UserNotFoundError をスローする', async () => {
			const repository = createRepositoryMock()
			repository.findById.mockResolvedValue(null)
			const service = createUserService(repository)

			await expect(service.getById('missing-user')).rejects.toThrow(UserNotFoundError)
		})
	})

	describe('create', () => {
		it('重複チェック時にメールを trim + lowercase して検索する', async () => {
			const repository = createRepositoryMock()
			repository.findByEmail.mockResolvedValue(baseUser)
			const service = createUserService(repository)

			await expect(
				service.create({ name: 'Alice', email: '  ALICE@EXAMPLE.COM  ' }),
			).rejects.toThrow(DuplicateEmailError)

			expect(repository.findByEmail).toHaveBeenCalledWith('alice@example.com')
			expect(repository.insert).not.toHaveBeenCalled()
		})

		it('新規ユーザーを作成して SharedUser 形式で返す', async () => {
			vi.useFakeTimers()
			vi.setSystemTime(new Date('2024-06-01T12:00:00.000Z'))

			const repository = createRepositoryMock()
			repository.findByEmail.mockResolvedValue(null)
			repository.insert.mockImplementation(async (user) => user)
			const service = createUserService(repository)

			const result = await service.create({ name: '  Bob  ', email: '  BOB@EXAMPLE.COM  ' })

			expect(repository.findByEmail).toHaveBeenCalledWith('bob@example.com')
			expect(repository.insert).toHaveBeenCalledTimes(1)
			const inserted = repository.insert.mock.calls[0]?.[0]
			expect(inserted?.name).toBe('Bob')
			expect(inserted?.email).toBe('bob@example.com')
			expect(inserted?.createdAt.toISOString()).toBe('2024-06-01T12:00:00.000Z')
			expect(inserted?.updatedAt.toISOString()).toBe('2024-06-01T12:00:00.000Z')

			expect(result).toMatchObject({
				id: expect.any(String) as string,
				name: 'Bob',
				email: 'bob@example.com',
				createdAt: '2024-06-01T12:00:00.000Z',
				updatedAt: '2024-06-01T12:00:00.000Z',
			})
		})
	})

	describe('update', () => {
		it('存在しない ID の場合は UserNotFoundError をスローする', async () => {
			const repository = createRepositoryMock()
			repository.findById.mockResolvedValue(null)
			const service = createUserService(repository)

			await expect(
				service.update('missing-user', {
					name: 'Bob',
					email: 'bob@example.com',
				}),
			).rejects.toThrow(UserNotFoundError)

			expect(repository.update).not.toHaveBeenCalled()
		})

		it('name と email を更新して SharedUser 形式で返す', async () => {
			const repository = createRepositoryMock()
			repository.findById.mockResolvedValue(baseUser)
			repository.update.mockImplementation(async (user) => user)
			const service = createUserService(repository)

			const result = await service.update('user-1', {
				name: '  Bob  ',
				email: '  BOB@EXAMPLE.COM  ',
			})

			expect(repository.findById).toHaveBeenCalledWith('user-1')
			expect(repository.update).toHaveBeenCalledTimes(1)
			const updated = repository.update.mock.calls[0]?.[0]
			expect(updated?.id).toBe('user-1')
			expect(updated?.name).toBe('Bob')
			expect(updated?.email).toBe('bob@example.com')
			expect(updated?.createdAt.toISOString()).toBe('2024-01-01T00:00:00.000Z')
			expect(updated?.updatedAt.getTime()).toBeGreaterThan(baseUser.updatedAt.getTime())

			expect(result).toMatchObject({
				id: 'user-1',
				name: 'Bob',
				email: 'bob@example.com',
			})
		})
	})

	describe('remove', () => {
		it('存在する ID の場合は削除する', async () => {
			const repository = createRepositoryMock()
			repository.findById.mockResolvedValue(baseUser)
			repository.delete.mockResolvedValue()
			const service = createUserService(repository)

			await service.remove('user-1')

			expect(repository.findById).toHaveBeenCalledWith('user-1')
			expect(repository.delete).toHaveBeenCalledWith('user-1')
		})

		it('存在しない ID の場合は UserNotFoundError をスローする', async () => {
			const repository = createRepositoryMock()
			repository.findById.mockResolvedValue(null)
			const service = createUserService(repository)

			await expect(service.remove('missing-user')).rejects.toThrow(UserNotFoundError)
			expect(repository.delete).not.toHaveBeenCalled()
		})
	})
})
