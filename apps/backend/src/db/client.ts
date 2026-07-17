import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema.js'

export const createDatabaseClient = (databaseUrl: string) => {
  const sql = postgres(databaseUrl)
  const db = drizzle(sql, { schema })

  return {
    db,
    close: async () => {
      await sql.end()
    },
  }
}

export type DatabaseClient = ReturnType<typeof createDatabaseClient>['db']
