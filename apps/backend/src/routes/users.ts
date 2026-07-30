import {
  createUserInputSchema,
  updateUserInputSchema,
} from '@modern-web-stack/shared'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import type { UserService } from '../services/user-service.js'

const paramsSchema = z.object({
  id: z.string().min(1, 'User id is required'),
})

const usersRoutes: FastifyPluginCallbackZod<{ userService: UserService }> = (
  app,
  options,
  done,
) => {
  const { userService } = options

  app.get('/users', async () => ({ data: await userService.list() }))

  app.get('/users/:id', {
    schema: {
      params: paramsSchema,
    },
  }, async (request) => {
    const user = await userService.getById(request.params.id)
    return { data: user }
  })

  app.post('/users', {
    schema: {
      body: createUserInputSchema,
    },
  }, async (request, reply) => {
    const user = await userService.create(request.body)
    reply.code(201)
    return { data: user }
  })

  app.put('/users/:id', {
    schema: {
      params: paramsSchema,
      body: updateUserInputSchema,
    },
  }, async (request) => {
    const user = await userService.update(request.params.id, request.body)
    return { data: user }
  })

  app.delete('/users/:id', {
    schema: {
      params: paramsSchema,
    },
  }, async (request) => {
    await userService.remove(request.params.id)
    return { data: { id: request.params.id } }
  })

  done()
}

export default usersRoutes
