import { useEmails } from '../hooks/useEmails'
import EmailRow from './EmailRow'

export default function InboxFeedView() {
  const { data: emails, isLoading, isError } = useEmails()

  if (isLoading) return <p className="p-6 text-sm text-brand-text/70">Loading emails…</p>
  if (isError) return <p className="p-6 text-sm text-rose-500">Couldn't load emails.</p>

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <p className="mb-3 text-xs text-brand-text/70">
        Correcting a category here helps improve the classifier over time.
      </p>
      {emails.length === 0 && <p className="text-sm text-brand-text/70">No emails synced yet.</p>}
      <ul className="divide-y divide-brand-text/15 rounded-lg border border-brand-text/20 bg-brand-plum/80">
        {emails.map((email) => (
          <EmailRow key={email.id} email={email} />
        ))}
      </ul>
    </div>
  )
}
