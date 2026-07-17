import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { UsersPage } from '@/pages/UsersPage'
import { renderWithProviders } from '@/test/test-utils'

describe('UsersPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows a loading state while fetching users', () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      () =>
        new Promise<Response>(() => {
          // Intentionally unresolved to verify loading state.
        }),
    )

    renderWithProviders(<UsersPage />)

    expect(screen.getByText('Loading users...')).toBeInTheDocument()
  })

  it('renders the user list', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              id: 'user-1',
              name: 'Jane Doe',
              email: 'jane@example.com',
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z',
            },
          ],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    renderWithProviders(<UsersPage />)

    expect(await screen.findByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })

  it('renders an error message when the API fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          message: 'Unexpected error occurred',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    renderWithProviders(<UsersPage />)

    expect(await screen.findByText('Failed to load users.')).toBeInTheDocument()
  })
})
