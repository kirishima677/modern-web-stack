import type { FastifyPluginCallback } from 'fastify'

const healthRoutes: FastifyPluginCallback = (app, _options, done) => {
  app.get('/health', () => Promise.resolve({ status: 'ok' }))

  done()
}

export default healthRoutes
