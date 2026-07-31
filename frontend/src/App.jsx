import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Nav from './components/Nav'
import KanbanBoard from './components/KanbanBoard'
import UpcomingDatesView from './components/UpcomingDatesView'
import InboxFeedView from './components/InboxFeedView'
import { triggerSync } from './api/client'

export default function App() {
  const [tab, setTab] = useState('board')
  const queryClient = useQueryClient()

  const sync = useMutation({
    mutationFn: triggerSync,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['emails'] })
    },
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <Nav active={tab} onChange={setTab} onSync={() => sync.mutate()} syncing={sync.isPending} />
      {tab === 'board' && <KanbanBoard />}
      {tab === 'dates' && <UpcomingDatesView />}
      {tab === 'inbox' && <InboxFeedView />}
    </div>
  )
}
