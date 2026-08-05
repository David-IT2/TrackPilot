const TABS = [
  { id: 'board', label: 'Board' },
  { id: 'dates', label: 'Upcoming' },
  { id: 'inbox', label: 'Inbox' },
]

export default function Nav({ active, onChange, onSync, syncing }) {
  return (
    <div className="border-b border-brand-text/15 bg-brand-plum/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-brand-text">Job tracker</span>
          <nav className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`rounded-md px-3 py-1.5 text-sm transition ${
                  active === tab.id
                    ? 'bg-brand-amber text-brand-plum font-medium'
                    : 'text-brand-text/75 hover:bg-brand-text/10 hover:text-brand-text'
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
          className="rounded-md border border-brand-text/25 px-3 py-1.5 text-sm text-brand-text hover:bg-brand-text/10 disabled:opacity-50"
        >
          {syncing ? 'Syncing…' : 'Sync now'}
        </button>
      </div>
    </div>
  )
}
