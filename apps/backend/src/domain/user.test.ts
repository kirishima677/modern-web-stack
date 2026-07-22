import { describe, it, expect } from 'vitest'

import { ValidationError } from '../errors.js'
import { User } from './user.js'

// ─── テスト用ヘルパー ──────────────────────────────────────────────────────────

const validProps = {
  id: 'user-1',
  name: 'Alice',
  email: 'alice@example.com',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
}

// ─── User.create ──────────────────────────────────────────────────────────────

describe('User.create', () => {
  describe('正常系', () => {
    it('有効なプロパティでインスタンスを生成できる', () => {
      const user = User.create(validProps)

      expect(user.id).toBe('user-1')
      expect(user.name).toBe('Alice')
      expect(user.email).toBe('alice@example.com')
      expect(user.createdAt).toEqual(validProps.createdAt)
      expect(user.updatedAt).toEqual(validProps.updatedAt)
    })

    it('メールアドレスは小文字に正規化される', () => {
      const user = User.create({ ...validProps, email: 'ALICE@EXAMPLE.COM' })
      expect(user.email).toBe('alice@example.com')
    })

    it('名前の前後の空白はトリムされる', () => {
      const user = User.create({ ...validProps, name: '  Alice  ' })
      expect(user.name).toBe('Alice')
    })

    it('名前が50文字の場合は生成できる', () => {
      const name = 'A'.repeat(50)
      const user = User.create({ ...validProps, name })
      expect(user.name).toBe(name)
    })
  })

  describe('異常系 - name', () => {
    it('空文字の場合は "Name is required" エラーをスローする', () => {
      expect(() => User.create({ ...validProps, name: '' })).toThrow('Name is required')
    })

    it.each([
      ['空白のみ', '   '],
      ['51文字以上', 'A'.repeat(51)],
    ])('%s の場合は ValidationError をスローする', (_label, name) => {
      expect(() => User.create({ ...validProps, name })).toThrow(ValidationError)
    })
  })

  describe('異常系 - email', () => {
    it('空文字の場合は "Email is required" エラーをスローする', () => {
      expect(() => User.create({ ...validProps, email: '' })).toThrow('Email is required')
    })

    it('@がない場合は "Enter a valid email address" エラーをスローする', () => {
      expect(() => User.create({ ...validProps, email: 'invalidemail' })).toThrow(
        'Enter a valid email address',
      )
    })

    it.each([
      ['空白のみ', '   '],
      ['ドメインがない', 'alice@'],
      ['ローカル部がない', '@example.com'],
    ])('%s の場合は ValidationError をスローする', (_label, email) => {
      expect(() => User.create({ ...validProps, email })).toThrow(ValidationError)
    })
  })
})

// ─── User.reconstruct ────────────────────────────────────────────────────────

describe('User.reconstruct', () => {
  describe('正常系', () => {
    it('有効なプロパティでインスタンスを再構築できる', () => {
      const user = User.reconstruct(validProps)

      expect(user.id).toBe('user-1')
      expect(user.name).toBe('Alice')
      expect(user.email).toBe('alice@example.com')
    })

    it('名前の前後の空白はトリムされる', () => {
      const user = User.reconstruct({ ...validProps, name: '  Alice  ' })
      expect(user.name).toBe('Alice')
    })

    it('メールアドレスは小文字に正規化される', () => {
      const user = User.reconstruct({ ...validProps, email: 'ALICE@EXAMPLE.COM' })
      expect(user.email).toBe('alice@example.com')
    })
  })

  describe('異常系', () => {
    it('無効な name が含まれていても ValidationError をスローする', () => {
      expect(() => User.reconstruct({ ...validProps, name: '' })).toThrow('Name is required')
    })

    it('無効な email が含まれていても ValidationError をスローする', () => {
      expect(() => User.reconstruct({ ...validProps, email: 'not-an-email' })).toThrow(
        'Enter a valid email address',
      )
    })
  })
})

// ─── User#changeName ─────────────────────────────────────────────────────────

describe('User#changeName', () => {
  describe('正常系', () => {
    it('新しい名前を持つ新しい User インスタンスを返す', () => {
      const user = User.create(validProps)
      const updated = user.changeName('Bob')

      expect(updated.name).toBe('Bob')
      expect(updated.id).toBe(user.id)
      expect(updated.email).toBe(user.email)
      expect(updated.createdAt).toEqual(user.createdAt)
    })

    it('元のインスタンスは変更されない（イミュータブル）', () => {
      const user = User.create(validProps)
      user.changeName('Bob')
      expect(user.name).toBe('Alice')
    })

    it('updatedAt が元の値より新しくなる', () => {
      const user = User.create(validProps) // updatedAt = 2024-01-01
      const updated = user.changeName('Bob')
      expect(updated.updatedAt.getTime()).toBeGreaterThan(user.updatedAt.getTime())
    })

    it('名前の前後の空白はトリムされる', () => {
      const user = User.create(validProps)
      const updated = user.changeName('  Bob  ')
      expect(updated.name).toBe('Bob')
    })
  })

  describe('異常系', () => {
    it('空文字を渡すと "Name is required" エラーをスローする', () => {
      const user = User.create(validProps)
      expect(() => user.changeName('')).toThrow('Name is required')
    })

    it.each([
      ['空白のみ', '   '],
      ['51文字以上', 'A'.repeat(51)],
    ])('%s を渡すと ValidationError をスローする', (_label, name) => {
      const user = User.create(validProps)
      expect(() => user.changeName(name)).toThrow(ValidationError)
    })
  })
})

// ─── User#changeEmail ────────────────────────────────────────────────────────

describe('User#changeEmail', () => {
  describe('正常系', () => {
    it('新しいメールアドレスを持つ新しい User インスタンスを返す', () => {
      const user = User.create(validProps)
      const updated = user.changeEmail('bob@example.com')

      expect(updated.email).toBe('bob@example.com')
      expect(updated.id).toBe(user.id)
      expect(updated.name).toBe(user.name)
      expect(updated.createdAt).toEqual(user.createdAt)
    })

    it('元のインスタンスは変更されない（イミュータブル）', () => {
      const user = User.create(validProps)
      user.changeEmail('bob@example.com')
      expect(user.email).toBe('alice@example.com')
    })

    it('メールアドレスは小文字に正規化される', () => {
      const user = User.create(validProps)
      const updated = user.changeEmail('BOB@EXAMPLE.COM')
      expect(updated.email).toBe('bob@example.com')
    })

    it('updatedAt が元の値より新しくなる', () => {
      const user = User.create(validProps) // updatedAt = 2024-01-01
      const updated = user.changeEmail('bob@example.com')
      expect(updated.updatedAt.getTime()).toBeGreaterThan(user.updatedAt.getTime())
    })
  })

  describe('異常系', () => {
    it('空文字を渡すと "Email is required" エラーをスローする', () => {
      const user = User.create(validProps)
      expect(() => user.changeEmail('')).toThrow('Email is required')
    })

    it.each([
      ['空白のみ', '   '],
      ['@がない', 'invalidemail'],
      ['ドメインがない', 'alice@'],
    ])('%s を渡すと ValidationError をスローする', (_label, email) => {
      const user = User.create(validProps)
      expect(() => user.changeEmail(email)).toThrow(ValidationError)
    })
  })
})

