import { afterEach, describe, expect, it, vi } from 'vitest'

import { deleteUser } from '@/features/users/api'

describe('deleteUser', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not send a JSON content type header when there is no request body', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: { id: 'user-1' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(deleteUser('user-1')).resolves.toBe('user-1')

    const [, options] = fetchMock.mock.calls[0] ?? []
    const headers = new Headers(options?.headers)

    expect(options?.method).toBe('DELETE')
    expect(headers.has('Content-Type')).toBe(false)
  })
})
