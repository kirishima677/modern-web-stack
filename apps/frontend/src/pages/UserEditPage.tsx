import type { ReactElement } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { PageStatus } from '@/components/PageStatus'
import { UserForm } from '@/components/UserForm'
import { useUser, useUpdateUser } from '@/hooks/use-users'
import { ApiError } from '@/lib/api'

export const UserEditPage = (): ReactElement => {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const userQuery = useUser(id)
  const updateUserMutation = useUpdateUser(id)

  if (userQuery.isLoading) {
    return <PageStatus title="Loading" message="Loading user..." />
  }

  if (userQuery.isError || !userQuery.data) {
    return <PageStatus title="Error" message="Failed to load the user." />
  }

  const handleSubmit = async (
    values: Parameters<typeof updateUserMutation.mutateAsync>[0],
  ): Promise<void> => {
    await updateUserMutation.mutateAsync(values)
    await navigate('/users')
  }

  return (
    <section className="stack">
      <div>
        <h1>ユーザー編集</h1>
        <p>既存ユーザーの情報を更新します。</p>
      </div>
      <UserForm
        initialValues={{
          name: userQuery.data.name,
          email: userQuery.data.email,
        }}
        submitLabel="更新"
        isSubmitting={updateUserMutation.isPending}
        apiError={
          updateUserMutation.error instanceof ApiError
            ? updateUserMutation.error.message
            : undefined
        }
        onSubmit={handleSubmit}
      />
    </section>
  )
}
