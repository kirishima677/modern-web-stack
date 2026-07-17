import cors from '@fastify/cors'
import Fastify, { type FastifyInstance } from 'fastify'

import { AppError, isDatabaseConflictError } from './errors.js'
import healthRoutes from './routes/health.js'
import usersRoutes from './routes/users.js'
import type { UserService } from './services/user-service.js'

export interface CreateAppOptions {
  userService: UserService
  logger?: boolean
}

export const createApp = async ({
  userService,
  logger = true,
}: CreateAppOptions): Promise<FastifyInstance> => {
  const app = Fastify({ logger })

  await app.register(cors, {
    origin: true,
  })

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      reply
        .status(error.statusCode)
        .send({ error: error.name, message: error.message })
      return
    }

    if (isDatabaseConflictError(error)) {
      reply
        .status(400)
        .send({ error: 'Bad Request', message: 'Email already exists' })
      return
    }

    app.log.error(error)
    reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Unexpected error occurred',
    })
  })

  await app.register(healthRoutes, { prefix: '/api' })
  await app.register(usersRoutes, { prefix: '/api', userService })

  return app
}
