import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { differenceInDays, formatDistanceToNow } from 'date-fns'

export default function ApplicationCard({ application, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  }

  const daysSinceApplied = application.applied_date
    ? differenceInDays(new Date(), new Date(application.applied_date))
    : null

  const nextEvent = [...(application.events || [])]
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0]

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onClick(application)}
      className="cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:border-slate-300 active:cursor-grabbing"
    >
      <p className="text-sm font-medium text-slate-900">{application.company}</p>
      <p className="mt-0.5 text-sm text-slate-500">{application.role}</p>
      <div className="mt-2 flex items-center justify-between">
        {daysSinceApplied !== null && (
          <span className="text-xs text-slate-400">{daysSinceApplied}d since applied</span>
        )}
        {nextEvent && (
          <span className="rounded-full bg-accent-50 px-2 py-0.5 text-xs font-medium text-accent-700">
            {eventLabel(nextEvent)}
          </span>
        )}
      </div>
    </div>
  )
}

function eventLabel(event) {
  const label = event.type === 'follow_up' ? 'Follow-up' : event.type[0].toUpperCase() + event.type.slice(1)
  return `${label} ${formatDistanceToNow(new Date(event.date), { addSuffix: true })}`
}
