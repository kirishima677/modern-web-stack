import { EmailAddress } from './EmailAddress.js'
import { UserName } from './UserName.js'

interface UserProps {
  id: string
  name: UserName
  email: EmailAddress
  createdAt: Date
  updatedAt: Date
}

export class User {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt: Date

  readonly #name: UserName
  readonly #email: EmailAddress

  private constructor(props: UserProps) {
    this.id = props.id
    this.#name = props.name
    this.#email = props.email
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  get name(): string {
    return this.#name.value
  }

  get email(): string {
    return this.#email.value
  }

  /**
   * Factory for creating a new User, enforcing all domain rules.
   */
  static create(props: {
    id: string
    name: string
    email: string
    createdAt: Date
    updatedAt: Date
  }): User {
    return new User({
      id: props.id,
      name: UserName.create(props.name),
      email: EmailAddress.create(props.email),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    })
  }

  /**
   * Reconstruct a User from a trusted source (e.g. DB), enforcing domain invariants via
   * Value Objects. Domain rules are still applied so that invalid persisted data is
   * never silently accepted.
   */
  static reconstruct(props: {
    id: string
    name: string
    email: string
    createdAt: Date
    updatedAt: Date
  }): User {
    return new User({
      id: props.id,
      name: UserName.create(props.name),
      email: EmailAddress.create(props.email),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    })
  }

  /**
   * Return a new User with the given name, validating only the new value.
   */
  changeName(name: string): User {
    return new User({
      id: this.id,
      name: UserName.create(name),
      email: this.#email,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }

  /**
   * Return a new User with the given email, validating only the new value.
   */
  changeEmail(email: string): User {
    return new User({
      id: this.id,
      name: this.#name,
      email: EmailAddress.create(email),
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }
}

