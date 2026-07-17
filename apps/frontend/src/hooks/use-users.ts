import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateUserInput, UpdateUserInput } from '@modern-web-stack/shared'

import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from '@/features/users/api'

export const userQueryKeys = {
  all: ['users'] as const,
  detail: (id: string) => ['users', id] as const,
}

export const useUsers = () =>
  useQuery({
    queryKey: userQueryKeys.all,
    queryFn: getUsers,
  })

export const useUser = (id: string) =>
  useQuery({
    queryKey: userQueryKeys.detail(id),
    queryFn: () => getUser(id),
    enabled: id.length > 0,
  })

export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userQueryKeys.all })
    },
  })
}

export const useUpdateUser = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateUserInput) => updateUser(id, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(id) }),
      ])
    },
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userQueryKeys.all })
    },
  })
}
