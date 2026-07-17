import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'

export const HomePage = (): ReactElement => (
  <section className="stack">
    <h1>Modern Web Stack</h1>
    <p>
      React、TypeScript、Fastify、PostgreSQL、Drizzle
      を使った学習用のフルスタック構成です。
    </p>
    <Link className="button-link" to="/users">
      ユーザー管理を開く
    </Link>
  </section>
)
