import {
  createUserInputSchema,
  updateUserInputSchema,
} from '@modern-web-stack/shared'
import type { FastifyPluginCallback } from 'fastify'
import { z } from 'zod'

import { AppError, formatZodError } from '../errors.js'
import type { UserService } from '../services/user-service.js'

const paramsSchema = z.object({
  id: z.string().min(1, 'User id is required'),
})

const usersRoutes: FastifyPluginCallback<{ userService: UserService }> = (
  app,
  options,
  done,
) => {
  const { userService } = options

  app.get('/users', async () => ({ data: await userService.list() }))

  app.get('/users/:id', async (request) => {
    const parsedParams = paramsSchema.safeParse(request.params)
    if (!parsedParams.success) {
      throw new AppError(400, formatZodError(parsedParams.error))
    }

    const user = await userService.getById(parsedParams.data.id)
    if (!user) {
      throw new AppError(404, 'User not found')
    }

    return { data: user }
  })

  app.post('/users', async (request, reply) => {
    const parsedBody = createUserInputSchema.safeParse(request.body)
    if (!parsedBody.success) {
      throw new AppError(400, formatZodError(parsedBody.error))
    }

    const user = await userService.create(parsedBody.data)
    reply.code(201)
    return { data: user }
  })

  app.put('/users/:id', async (request) => {
    const parsedParams = paramsSchema.safeParse(request.params)
    if (!parsedParams.success) {
      throw new AppError(400, formatZodError(parsedParams.error))
    }

    const parsedBody = updateUserInputSchema.safeParse(request.body)
    if (!parsedBody.success) {
      throw new AppError(400, formatZodError(parsedBody.error))
    }

    const user = await userService.update(parsedParams.data.id, parsedBody.data)
    if (!user) {
      throw new AppError(404, 'User not found')
    }

    return { data: user }
  })

  app.delete('/users/:id', async (request) => {
    const parsedParams = paramsSchema.safeParse(request.params)
    if (!parsedParams.success) {
      throw new AppError(400, formatZodError(parsedParams.error))
    }

    const removed = await userService.remove(parsedParams.data.id)
    if (!removed) {
      throw new AppError(404, 'User not found')
    }

    return { data: { id: parsedParams.data.id } }
  })

  done()
}

export default usersRoutes
