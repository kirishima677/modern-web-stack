import { createBrowserRouter } from 'react-router-dom'

import { Layout } from '@/components/Layout'
import { HomePage } from '@/pages/HomePage'
import { UserCreatePage } from '@/pages/UserCreatePage'
import { UserEditPage } from '@/pages/UserEditPage'
import { UsersPage } from '@/pages/UsersPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'users/new',
        element: <UserCreatePage />,
      },
      {
        path: 'users/:id/edit',
        element: <UserEditPage />,
      },
    ],
  },
])
