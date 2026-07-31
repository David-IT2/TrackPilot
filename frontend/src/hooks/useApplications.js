import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { fetchApplications, updateApplicationStatus, updateApplicationNotes } from '../api/client'

export function useApplications() {
  return useQuery({ queryKey: ['applications'], queryFn: fetchApplications })
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => updateApplicationStatus(id, status),
    // Optimistic update: move the card immediately, roll back on failure.
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['applications'] })
      const previous = queryClient.getQueryData(['applications'])
      queryClient.setQueryData(['applications'], (old) =>
        old?.map((a) => (a.id === id ? { ...a, status } : a))
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['applications'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })
}

export function useUpdateApplicationNotes() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notes }) => updateApplicationNotes(id, notes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
  })
}
