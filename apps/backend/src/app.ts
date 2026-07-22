import cors from '@fastify/cors'
import Fastify, { type FastifyInstance } from 'fastify'

import {
  AppError,
  DuplicateEmailError,
  UserNotFoundError,
  ValidationError,
} from './errors.js'
import healthRoutes from './routes/health.js'
import usersRoutes from './routes/users.js'
import type { UserService } from './services/user-service.js'

export interface CreateAppOptions {
  userService: UserService
  logger?: boolean
}

const isDomainError = (
  error: unknown,
): error is ValidationError | DuplicateEmailError | UserNotFoundError =>
  error instanceof ValidationError ||
  error instanceof DuplicateEmailError ||
  error instanceof UserNotFoundError

export const createApp = async ({
  userService,
  logger = true,
}: CreateAppOptions): Promise<FastifyInstance> => {
  const app = Fastify({ logger })

  await app.register(cors, {
    origin: true,
  })

  app.setErrorHandler((error, _request, reply) => {
    if (isDomainError(error)) {
      reply
        .status(error.statusCode)
        .send({ error: error.name, message: error.message })
      return
    }

    if (error instanceof AppError) {
      reply
        .status(error.statusCode)
        .send({ error: error.name, message: error.message })
      return
    }

    if (
      error instanceof Error &&
      'statusCode' in error &&
      typeof error.statusCode === 'number' &&
      error.statusCode >= 400 &&
      error.statusCode < 500
    ) {
      reply.status(error.statusCode).send({
        error: error.name,
        message: error.message,
      })
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
