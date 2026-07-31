import { useState } from 'react'
import { DndContext } from '@dnd-kit/core'
import KanbanColumn from './KanbanColumn'
import ApplicationDetailPanel from './ApplicationDetailPanel'
import { useApplications, useUpdateApplicationStatus } from '../hooks/useApplications'

const STATUSES = ['applied', 'interview', 'offer', 'rejected']

export default function KanbanBoard() {
  const { data: applications, isLoading, isError } = useApplications()
  const updateStatus = useUpdateApplicationStatus()
  const [selected, setSelected] = useState(null)

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over) return
    const newStatus = over.id
    const app = applications.find((a) => a.id === active.id)
    if (app && app.status !== newStatus) {
      updateStatus.mutate({ id: active.id, status: newStatus })
    }
  }

  if (isLoading) return <p className="p-6 text-sm text-slate-400">Loading applications…</p>
  if (isError) return <p className="p-6 text-sm text-rose-500">Couldn't load applications.</p>

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              applications={applications.filter((a) => a.status === status)}
              onCardClick={setSelected}
            />
          ))}
        </div>
      </DndContext>
      <ApplicationDetailPanel application={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
