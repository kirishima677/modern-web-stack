import {
  createUserInputSchema,
  updateUserInputSchema,
} from '@modern-web-stack/shared'
import type { FastifyPluginCallback } from 'fastify'
import { z } from 'zod'

import { ValidationError, formatZodError } from '../errors.js'
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
      throw new ValidationError(formatZodError(parsedParams.error))
    }

    const user = await userService.getById(parsedParams.data.id)
    return { data: user }
  })

  app.post('/users', async (request, reply) => {
    const parsedBody = createUserInputSchema.safeParse(request.body)
    if (!parsedBody.success) {
      throw new ValidationError(formatZodError(parsedBody.error))
    }

    const user = await userService.create(parsedBody.data)
    reply.code(201)
    return { data: user }
  })

  app.put('/users/:id', async (request) => {
    const parsedParams = paramsSchema.safeParse(request.params)
    if (!parsedParams.success) {
      throw new ValidationError(formatZodError(parsedParams.error))
    }

    const parsedBody = updateUserInputSchema.safeParse(request.body)
    if (!parsedBody.success) {
      throw new ValidationError(formatZodError(parsedBody.error))
    }

    const user = await userService.update(parsedParams.data.id, parsedBody.data)
    return { data: user }
  })

  app.delete('/users/:id', async (request) => {
    const parsedParams = paramsSchema.safeParse(request.params)
    if (!parsedParams.success) {
      throw new ValidationError(formatZodError(parsedParams.error))
    }

    await userService.remove(parsedParams.data.id)
    return { data: { id: parsedParams.data.id } }
  })

  done()
}

export default usersRoutes
