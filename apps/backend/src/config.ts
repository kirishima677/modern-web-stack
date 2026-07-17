import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { config as loadDotenv } from 'dotenv'
import { z } from 'zod'

const loadEnvironmentFiles = (): void => {
  const candidatePaths = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '../../.env'),
  ]

  for (const path of candidatePaths) {
    if (existsSync(path)) {
      loadDotenv({ path, override: false })
      break
    }
  }
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  BACKEND_PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:3000'),
})

export type AppEnv = z.infer<typeof envSchema>

export const loadEnv = (): AppEnv => {
  loadEnvironmentFiles()

  return envSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    BACKEND_PORT: process.env.BACKEND_PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
  })
}
