import type { ReactElement } from 'react'

export interface PageStatusProps {
  title: string
  message: string
}

export const PageStatus = ({
  title,
  message,
}: PageStatusProps): ReactElement => (
  <section aria-live="polite" className="status-panel">
    <h2>{title}</h2>
    <p>{message}</p>
  </section>
)
