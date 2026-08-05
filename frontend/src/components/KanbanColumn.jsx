import { useDroppable } from '@dnd-kit/core'
import ApplicationCard from './ApplicationCard'

const STATUS_META = {
  applied: { label: 'Applied', dot: 'bg-brand-text/60' },
  interview: { label: 'Interview', dot: 'bg-accent-500' },
  offer: { label: 'Offer', dot: 'bg-emerald-500' },
  rejected: { label: 'Rejected', dot: 'bg-rose-400' },
}

export default function KanbanColumn({ status, applications, onCardClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const meta = STATUS_META[status]

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
        <span className="text-sm font-medium text-brand-text">{meta.label}</span>
        <span className="text-xs text-brand-text/65">{applications.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-[200px] flex-1 flex-col gap-2 rounded-lg p-2 transition ${
          isOver ? 'bg-brand-amber/25' : 'bg-brand-plum/55'
        }`}
      >
        {applications.length === 0 && (
          <p className="mt-6 text-center text-xs text-brand-text/60">Nothing here yet</p>
        )}
        {applications.map((app) => (
          <ApplicationCard key={app.id} application={app} onClick={onCardClick} />
        ))}
      </div>
    </div>
  )
}
