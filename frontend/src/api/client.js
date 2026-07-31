// Real API calls to the FastAPI backend. Every function here has the
// same shape/signature whether mock mode is on or off, so hooks never
// need to know which one they're calling.
import { mockApplications, mockEvents, mockEmails } from './mockData'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API error ${res.status}: ${text}`)
  }
  if (res.status === 204) return null
  return res.json()
}

// ---------- Applications ----------

export async function fetchApplications() {
  if (USE_MOCK) {
    await delay(300)
    return mockApplications
  }
  return request('/applications')
}

export async function updateApplicationStatus(id, status) {
  if (USE_MOCK) {
    await delay(150)
    const app = mockApplications.find((a) => a.id === id)
    if (app) app.status = status
    return app
  }
  return request(`/applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function updateApplicationNotes(id, notes) {
  if (USE_MOCK) {
    await delay(150)
    const app = mockApplications.find((a) => a.id === id)
    if (app) app.notes = notes
    return app
  }
  return request(`/applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ notes }),
  })
}

// ---------- Events ----------

export async function fetchUpcomingEvents() {
  if (USE_MOCK) {
    await delay(200)
    return mockEvents
  }
  return request('/events?upcoming=true')
}

// ---------- Emails ----------

export async function fetchEmails() {
  if (USE_MOCK) {
    await delay(250)
    return mockEmails
  }
  return request('/emails')
}

export async function correctEmailCategory(id, category) {
  if (USE_MOCK) {
    await delay(150)
    const email = mockEmails.find((e) => e.id === id)
    if (email) email.category_corrected = category
    return email
  }
  return request(`/emails/${id}/category`, {
    method: 'PATCH',
    body: JSON.stringify({ category }),
  })
}

// ---------- Sync ----------

export async function triggerSync() {
  if (USE_MOCK) {
    await delay(800)
    return { new_emails_found: 0, applications_created: 0, events_created: 0 }
  }
  return request('/sync/run', { method: 'POST' })
}

export async function fetchSyncStatus() {
  if (USE_MOCK) {
    await delay(100)
    return { last_synced_at: new Date().toISOString(), last_history_id: 'mock' }
  }
  return request('/sync/status')
}
