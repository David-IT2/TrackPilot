// Sample data so the UI is browsable before the backend/AI pipeline is wired up.
// Shapes match what the real FastAPI endpoints return.

const now = Date.now()
const daysAgo = (n) => new Date(now - n * 86400000).toISOString()
const daysFromNow = (n) => new Date(now + n * 86400000).toISOString()

export const mockApplications = [
  { id: 'a1', company: 'Pesapal', role: 'Sales Representative', status: 'interview', applied_date: daysAgo(6), notes: '', created_at: daysAgo(6), updated_at: daysAgo(1), events: [{ id: 'e1', type: 'interview', date: daysFromNow(3), application_id: 'a1' }] },
  { id: 'a2', company: 'Cellulant', role: 'Backend Developer', status: 'applied', applied_date: daysAgo(10), notes: 'Applied via referral', created_at: daysAgo(10), updated_at: daysAgo(10), events: [] },
  { id: 'a3', company: 'Zydii Africa', role: 'Full-Stack Developer', status: 'rejected', applied_date: daysAgo(30), notes: '', created_at: daysAgo(30), updated_at: daysAgo(20), events: [] },
  { id: 'a4', company: 'Wasoko', role: 'Software Engineer', status: 'applied', applied_date: daysAgo(4), notes: '', created_at: daysAgo(4), updated_at: daysAgo(4), events: [] },
  { id: 'a5', company: 'M-KOPA', role: 'Frontend Engineer', status: 'interview', applied_date: daysAgo(14), notes: 'Technical round next', created_at: daysAgo(14), updated_at: daysAgo(2), events: [{ id: 'e2', type: 'deadline', date: daysFromNow(1), application_id: 'a5' }] },
  { id: 'a6', company: 'Twiga Foods', role: 'Product Analyst', status: 'offer', applied_date: daysAgo(25), notes: 'Offer received, negotiating', created_at: daysAgo(25), updated_at: daysAgo(1), events: [] },
  { id: 'a7', company: 'Sendy', role: 'Junior Developer', status: 'rejected', applied_date: daysAgo(40), notes: '', created_at: daysAgo(40), updated_at: daysAgo(33), events: [] },
  { id: 'a8', company: 'Betternship', role: 'Software Engineer (placement)', status: 'applied', applied_date: daysAgo(2), notes: '', created_at: daysAgo(2), updated_at: daysAgo(2), events: [] },
  { id: 'a9', company: 'Gebeya', role: 'Full-Stack Developer', status: 'applied', applied_date: daysAgo(1), notes: '', created_at: daysAgo(1), updated_at: daysAgo(1), events: [] },
  { id: 'a10', company: 'Craft Silicon', role: 'Backend Engineer', status: 'interview', applied_date: daysAgo(18), notes: '', created_at: daysAgo(18), updated_at: daysAgo(5), events: [{ id: 'e3', type: 'follow_up', date: daysFromNow(6), application_id: 'a10' }] },
  { id: 'a11', company: 'Kilimani SME Co', role: 'Freelance Dev', status: 'applied', applied_date: daysAgo(3), notes: '', created_at: daysAgo(3), updated_at: daysAgo(3), events: [] },
]

export const mockEvents = mockApplications
  .flatMap((a) => a.events.map((e) => ({ ...e, company: a.company, role: a.role })))
  .sort((a, b) => new Date(a.date) - new Date(b.date))

export const mockEmails = [
  { id: 'em1', gmail_message_id: 'g1', subject: 'Interview invitation - Sales Representative', sender: 'recruiting@pesapal.com', snippet: "We'd like to invite you to interview for...", received_at: daysAgo(1), category: 'interview_invite', category_confidence: 0.94, category_corrected: null, application_id: 'a1' },
  { id: 'em2', gmail_message_id: 'g2', subject: 'Thank you for applying to Cellulant', sender: 'noreply@cellulant.com', snippet: 'We have received your application for...', received_at: daysAgo(10), category: 'application_confirmation', category_confidence: 0.88, category_corrected: null, application_id: 'a2' },
  { id: 'em3', gmail_message_id: 'g3', subject: 'Update on your application', sender: 'careers@zydii.africa', snippet: 'After careful consideration we regret to inform...', received_at: daysAgo(20), category: 'rejection', category_confidence: 0.91, category_corrected: null, application_id: 'a3' },
  { id: 'em4', gmail_message_id: 'g4', subject: 'Your weekly newsletter', sender: 'digest@techweekly.com', snippet: 'This week in African tech...', received_at: daysAgo(2), category: 'not_job_related', category_confidence: 0.97, category_corrected: null, application_id: null },
  { id: 'em5', gmail_message_id: 'g5', subject: 'Technical assessment - M-KOPA', sender: 'talent@m-kopa.com', snippet: 'Please complete the attached coding assessment by...', received_at: daysAgo(5), category: 'assessment', category_confidence: 0.79, category_corrected: null, application_id: 'a5' },
  { id: 'em6', gmail_message_id: 'g6', subject: 'Offer letter - Product Analyst', sender: 'hr@twigafoods.com', snippet: 'We are pleased to extend an offer...', received_at: daysAgo(1), category: 'offer', category_confidence: 0.96, category_corrected: null, application_id: 'a6' },
  { id: 'em7', gmail_message_id: 'g7', subject: 'Re: Craft Silicon application', sender: 'jobs@craftsilicon.com', snippet: 'Thanks for your continued interest, following up on...', received_at: daysAgo(5), category: 'application_confirmation', category_confidence: 0.55, category_corrected: 'interview_invite', application_id: 'a10' },
]
