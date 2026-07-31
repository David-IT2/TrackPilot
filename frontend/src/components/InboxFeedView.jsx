import { useEmails } from '../hooks/useEmails'
import EmailRow from './EmailRow'

export default function InboxFeedView() {
  const { data: emails, isLoading, isError } = useEmails()

  if (isLoading) return <p className="p-6 text-sm text-slate-400">Loading emails…</p>
  if (isError) return <p className="p-6 text-sm text-rose-500">Couldn't load emails.</p>

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <p className="mb-3 text-xs text-slate-400">
        Correcting a category here helps improve the classifier over time.
      </p>
      {emails.length === 0 && <p className="text-sm text-slate-400">No emails synced yet.</p>}
      <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {emails.map((email) => (
          <EmailRow key={email.id} email={email} />
        ))}
      </ul>
    </div>
  )
}
