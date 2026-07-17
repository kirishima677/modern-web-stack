import 'dotenv/config'

import { createApp } from './app.js'
import { loadEnv } from './config.js'
import { createDatabaseClient } from './db/client.js'
import { createDatabaseUserService } from './services/user-service.js'

const startServer = async (): Promise<void> => {
  const env = loadEnv()
  const { db, close } = createDatabaseClient(env.DATABASE_URL)
  const userService = createDatabaseUserService(db)
  const app = await createApp({ userService, logger: true })

  app.addHook('onClose', async () => {
    await close()
  })

  try {
    await app.listen({
      port: env.BACKEND_PORT,
      host: '0.0.0.0',
    })
  } catch (error) {
    app.log.error(error)
    process.exitCode = 1
    await app.close()
  }
}

void startServer()
