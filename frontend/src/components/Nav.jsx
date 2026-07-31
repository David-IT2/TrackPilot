const TABS = [
  { id: 'board', label: 'Board' },
  { id: 'dates', label: 'Upcoming' },
  { id: 'inbox', label: 'Inbox' },
]

export default function Nav({ active, onChange, onSync, syncing }) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-slate-900">Job tracker</span>
          <nav className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`rounded-md px-3 py-1.5 text-sm transition ${
                  active === tab.id
                    ? 'bg-accent-50 text-accent-700 font-medium'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <button
          onClick={onSync}
          disabled={syncing}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          {syncing ? 'Syncing…' : 'Sync now'}
        </button>
      </div>
    </div>
  )
}
