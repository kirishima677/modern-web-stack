import { z } from 'zod'

import { ValidationError } from '../errors.js'

const nameRule = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(50, 'Name must be 50 characters or less')

const emailRule = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email address')
  .transform((v) => v.toLowerCase())

interface UserProps {
  id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export class User {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly createdAt: Date
  readonly updatedAt: Date

  private constructor(props: UserProps) {
    this.id = props.id
    this.name = props.name
    this.email = props.email
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  /**
   * Factory for creating a new User, with domain rule validation.
   */
  static create(props: UserProps): User {
    const nameResult = nameRule.safeParse(props.name)
    if (!nameResult.success) {
      throw new ValidationError(nameResult.error.issues[0]?.message ?? 'Invalid name')
    }

    const emailResult = emailRule.safeParse(props.email)
    if (!emailResult.success) {
      throw new ValidationError(emailResult.error.issues[0]?.message ?? 'Invalid email')
    }

    return new User({
      ...props,
      name: nameResult.data,
      email: emailResult.data,
    })
  }

  /**
   * Reconstruct a User from a trusted source (e.g. DB) without validation.
   */
  static reconstruct(props: UserProps): User {
    return new User(props)
  }

  changeName(name: string): User {
    return User.create({
      id: this.id,
      name,
      email: this.email,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }

  changeEmail(email: string): User {
    return User.create({
      id: this.id,
      name: this.name,
      email,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }
}
