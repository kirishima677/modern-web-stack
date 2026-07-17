import 'dotenv/config'

import { migrate } from 'drizzle-orm/postgres-js/migrator'

import { loadEnv } from '../config.js'
import { createDatabaseClient } from './client.js'

const run = async (): Promise<void> => {
  const env = loadEnv()
  const client = createDatabaseClient(env.DATABASE_URL)

  try {
    await migrate(client.db, { migrationsFolder: 'drizzle' })
    console.info('Database migrations completed')
  } finally {
    await client.close()
  }
}

void run()
