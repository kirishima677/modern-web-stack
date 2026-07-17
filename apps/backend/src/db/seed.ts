import 'dotenv/config'

import { createUserInputSchema } from '@modern-web-stack/shared'

import { loadEnv } from '../config.js'
import { createDatabaseClient } from './client.js'
import { createDatabaseUserService } from '../services/user-service.js'

const seedUsers = [
  createUserInputSchema.parse({
    name: 'Alice Example',
    email: 'alice@example.com',
  }),
  createUserInputSchema.parse({
    name: 'Bob Example',
    email: 'bob@example.com',
  }),
]

const run = async (): Promise<void> => {
  const env = loadEnv()
  const client = createDatabaseClient(env.DATABASE_URL)
  const userService = createDatabaseUserService(client.db)

  try {
    const existing = await userService.list()
    if (existing.length === 0) {
      for (const user of seedUsers) {
        await userService.create(user)
      }
      console.info('Seed data inserted')
    } else {
      console.info('Seed skipped because users already exist')
    }
  } finally {
    await client.close()
  }
}

void run()
