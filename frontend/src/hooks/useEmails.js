import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { fetchEmails, correctEmailCategory } from '../api/client'

export function useEmails() {
  return useQuery({ queryKey: ['emails'], queryFn: fetchEmails })
}

export function useCorrectEmailCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, category }) => correctEmailCategory(id, category),
    onMutate: async ({ id, category }) => {
      await queryClient.cancelQueries({ queryKey: ['emails'] })
      const previous = queryClient.getQueryData(['emails'])
      queryClient.setQueryData(['emails'], (old) =>
        old?.map((e) => (e.id === id ? { ...e, category_corrected: category } : e))
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['emails'], context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
