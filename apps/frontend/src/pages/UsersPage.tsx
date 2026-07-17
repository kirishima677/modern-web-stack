import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'

import { PageStatus } from '@/components/PageStatus'
import { useDeleteUser, useUsers } from '@/hooks/use-users'

export const UsersPage = (): ReactElement => {
  const usersQuery = useUsers()
  const deleteUserMutation = useDeleteUser()

  if (usersQuery.isLoading) {
    return <PageStatus title="Loading" message="Loading users..." />
  }

  if (usersQuery.isError) {
    return <PageStatus title="Error" message="Failed to load users." />
  }

  const users = usersQuery.data ?? []

  const handleDelete = async (id: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return
    }

    await deleteUserMutation.mutateAsync(id)
  }

  return (
    <section className="stack">
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p>ユーザー一覧、編集、削除を確認できます。</p>
        </div>
        <Link className="button-link" to="/users/new">
          新規登録
        </Link>
      </div>

      {users.length === 0 ? (
        <PageStatus
          title="No users"
          message="No users have been created yet."
        />
      ) : null}

      {users.length > 0 ? (
        <ul className="user-list">
          {users.map((user) => (
            <li className="user-card" key={user.id}>
              <div>
                <h2>{user.name}</h2>
                <p>{user.email}</p>
              </div>
              <div className="card-actions">
                <Link to={`/users/${user.id}/edit`}>編集</Link>
                <button
                  type="button"
                  onClick={() => void handleDelete(user.id)}
                >
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {deleteUserMutation.isError ? (
        <p className="form-error">Failed to delete the user.</p>
      ) : null}
    </section>
  )
}
