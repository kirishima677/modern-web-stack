import {
  createUserInputSchema,
  deleteUserResponseSchema,
  type CreateUserInput,
  type UpdateUserInput,
  type User,
  userResponseSchema,
  usersResponseSchema,
} from '@modern-web-stack/shared'

import { request } from '@/lib/api'

export const getUsers = async (): Promise<User[]> => {
  const response = await request(
    '/users',
    { method: 'GET' },
    usersResponseSchema,
  )
  return response.data
}

export const getUser = async (id: string): Promise<User> => {
  const response = await request(
    `/users/${id}`,
    { method: 'GET' },
    userResponseSchema,
  )
  return response.data
}

export const createUser = async (input: CreateUserInput): Promise<User> => {
  const payload = createUserInputSchema.parse(input)
  const response = await request(
    '/users',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    userResponseSchema,
  )

  return response.data
}

export const updateUser = async (
  id: string,
  input: UpdateUserInput,
): Promise<User> => {
  const response = await request(
    `/users/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(createUserInputSchema.parse(input)),
    },
    userResponseSchema,
  )

  return response.data
}

export const deleteUser = async (id: string): Promise<string> => {
  const response = await request(
    `/users/${id}`,
    { method: 'DELETE' },
    deleteUserResponseSchema,
  )
  return response.data.id
}
