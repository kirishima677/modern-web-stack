import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'

import { UserForm } from '@/components/UserForm'
import { ApiError } from '@/lib/api'
import { useCreateUser } from '@/hooks/use-users'

export const UserCreatePage = (): ReactElement => {
  const navigate = useNavigate()
  const createUserMutation = useCreateUser()

  const handleSubmit = async (
    values: Parameters<typeof createUserMutation.mutateAsync>[0],
  ): Promise<void> => {
    await createUserMutation.mutateAsync(values)
    await navigate('/users')
  }

  return (
    <section className="stack">
      <div>
        <h1>ユーザー登録</h1>
        <p>名前とメールアドレスを入力して新しいユーザーを作成します。</p>
      </div>
      <UserForm
        submitLabel="保存"
        isSubmitting={createUserMutation.isPending}
        apiError={
          createUserMutation.error instanceof ApiError
            ? createUserMutation.error.message
            : undefined
        }
        onSubmit={handleSubmit}
      />
    </section>
  )
}
