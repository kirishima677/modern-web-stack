import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { UserForm } from '@/components/UserForm'
import { renderWithProviders } from '@/test/test-utils'

describe('UserForm', () => {
  it('shows validation messages for invalid input', async () => {
    const onSubmit = vi.fn(() => Promise.resolve())
    const user = userEvent.setup()

    renderWithProviders(
      <UserForm submitLabel="保存" isSubmitting={false} onSubmit={onSubmit} />,
    )

    await user.click(screen.getByRole('button', { name: '保存' }))

    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(await screen.findByText('Email is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
