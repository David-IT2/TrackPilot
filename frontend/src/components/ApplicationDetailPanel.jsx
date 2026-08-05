import { useState } from 'react'
import { format } from 'date-fns'
import { useUpdateApplicationNotes } from '../hooks/useApplications'

export default function ApplicationDetailPanel({ application, onClose }) {
  const [notes, setNotes] = useState(application?.notes || '')
  const updateNotes = useUpdateApplicationNotes()

  if (!application) return null

  const handleSaveNotes = () => {
    updateNotes.mutate({ id: application.id, notes })
  }

  return (
    <div className="fixed inset-0 z-20 flex justify-end bg-brand-plum/50" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-brand-plum p-6 text-brand-text shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-medium text-brand-text">{application.company}</h2>
            <p className="text-sm text-brand-text/70">{application.role}</p>
          </div>
          <button onClick={onClose} className="text-brand-text/60 hover:text-brand-text">
            ✕
          </button>
        </div>

        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-text/60">Status</p>
          <p className="mt-1 text-sm capitalize text-brand-text">{application.status}</p>
        </div>

        {application.applied_date && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-text/60">Applied</p>
            <p className="mt-1 text-sm text-brand-text">
              {format(new Date(application.applied_date), 'MMM d, yyyy')}
            </p>
          </div>
        )}

        {application.events?.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-text/60">Dates</p>
            <ul className="mt-1 space-y-1">
              {application.events.map((event) => (
                <li key={event.id} className="text-sm text-brand-text">
                  <span className="capitalize">{event.type.replace('_', ' ')}</span> —{' '}
                  {format(new Date(event.date), 'MMM d, yyyy')}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-text/60">Notes</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleSaveNotes}
            rows={5}
            placeholder="Add notes about this application…"
            className="mt-1 w-full rounded-md border border-brand-text/25 bg-brand-plum/70 p-2 text-sm text-brand-text placeholder:text-brand-text/45 focus:border-brand-amber focus:outline-none"
          />
        </div>
      </div>
    </div>
  )
}
