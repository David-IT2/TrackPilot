import { format, isPast, formatDistanceToNow } from 'date-fns'
import { useUpcomingEvents } from '../hooks/useEvents'

const TYPE_LABEL = {
  interview: 'Interview',
  deadline: 'Deadline',
  follow_up: 'Follow-up',
  other: 'Date',
}

export default function UpcomingDatesView() {
  const { data: events, isLoading, isError } = useUpcomingEvents()

  if (isLoading) return <p className="p-6 text-sm text-slate-400">Loading dates…</p>
  if (isError) return <p className="p-6 text-sm text-rose-500">Couldn't load upcoming dates.</p>

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      {events.length === 0 && (
        <p className="text-sm text-slate-400">No upcoming dates. Nothing to worry about right now.</p>
      )}
      <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {events.map((event) => {
          const overdue = isPast(new Date(event.date))
          return (
            <li key={event.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {TYPE_LABEL[event.type] || 'Date'} — {event.company}
                </p>
                <p className="text-xs text-slate-500">{event.role}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm ${overdue ? 'font-medium text-rose-500' : 'text-slate-700'}`}>
                  {format(new Date(event.date), 'MMM d, yyyy')}
                </p>
                <p className={`text-xs ${overdue ? 'text-rose-400' : 'text-slate-400'}`}>
                  {overdue ? 'Overdue' : formatDistanceToNow(new Date(event.date), { addSuffix: true })}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
