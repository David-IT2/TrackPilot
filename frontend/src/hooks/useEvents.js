import { useQuery } from '@tanstack/react-query'
import { fetchUpcomingEvents } from '../api/client'

export function useUpcomingEvents() {
  return useQuery({ queryKey: ['events', 'upcoming'], queryFn: fetchUpcomingEvents })
}
