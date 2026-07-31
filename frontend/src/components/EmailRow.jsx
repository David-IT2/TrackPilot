import { format } from 'date-fns'
import { useCorrectEmailCategory } from '../hooks/useEmails'

const CATEGORIES = [
  'application_confirmation',
  'interview_invite',
  'assessment',
  'rejection',
  'offer',
  'not_job_related',
]

const CATEGORY_LABEL = {
  application_confirmation: 'Application confirmation',
  interview_invite: 'Interview invite',
  assessment: 'Assessment',
  rejection: 'Rejection',
  offer: 'Offer',
  not_job_related: 'Not job-related',
  uncategorized: 'Uncategorized',
}

export default function EmailRow({ email }) {
  const correctCategory = useCorrectEmailCategory()
  const effectiveCategory = email.category_corrected || email.category
  const wasCorrected = Boolean(email.category_corrected)

  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">{email.subject}</p>
        <p className="truncate text-xs text-slate-500">{email.sender}</p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {!wasCorrected && email.category_confidence != null && (
          <span className="text-xs text-slate-400">{Math.round(email.category_confidence * 100)}%</span>
        )}
        <select
          value={effectiveCategory}
          onChange={(e) => correctCategory.mutate({ id: email.id, category: e.target.value })}
          className={`rounded-md border px-2 py-1 text-xs ${
            wasCorrected ? 'border-accent-300 bg-accent-50 text-accent-700' : 'border-slate-200 text-slate-600'
          }`}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABEL[cat]}
            </option>
          ))}
        </select>
        <span className="w-20 shrink-0 text-right text-xs text-slate-400">
          {email.received_at ? format(new Date(email.received_at), 'MMM d') : ''}
        </span>
      </div>
    </li>
  )
}
