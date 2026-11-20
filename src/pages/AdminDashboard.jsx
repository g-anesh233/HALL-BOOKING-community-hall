import { useCallback, useEffect, useState } from 'react'
import HallForm from '../components/HallForm'
import ManagementHeader from '../components/ManagementHeader'
import { apiUrl } from '../api'
import '../App.css'

async function requestJson(path, options = {}) {
  const response = await fetch(apiUrl(path), {
    ...options,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('hallbookToken')}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'The request could not be completed.')
  }

  return data
}

function AdminDashboard() {
  const [bookings, setBookings] = useState([])
  const [applications, setApplications] = useState([])
  const [halls, setHalls] = useState([])
  const [activeTab, setActiveTab] = useState('bookings')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const loadDashboard = useCallback(async () => {
    try {
      const [bookingData, applicationData, hallData] = await Promise.all([
        requestJson('/admin/bookings'),
        requestJson('/admin/owner-applications'),
        requestJson('/admin/halls')
      ])
      setBookings(bookingData)
      setApplications(applicationData)
      setHalls(hallData)
    } catch (error) {
      setMessage(error.message || 'Unable to load admin dashboard.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const initialLoad = window.setTimeout(loadDashboard, 0)
    return () => window.clearTimeout(initialLoad)
  }, [loadDashboard])

  const performAction = async (path, body, successMessage) => {
    setSubmitting(true)
    setMessage('')
    try {
      const data = await requestJson(path, {
        method: 'PATCH',
        body: JSON.stringify(body)
      })
      await loadDashboard()
      setMessage(data.message || successMessage)
      return true
    } catch (error) {
      setMessage(error.message || 'Unable to complete the action.')
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const addHall = async (hallInput) => {
    setSubmitting(true)
    setMessage('')
    try {
      const data = await requestJson('/admin/halls', {
        method: 'POST',
        body: JSON.stringify(hallInput)
      })
      setHalls((current) => [data.hall, ...current])
      setMessage(data.message)
      return true
    } catch (error) {
      setMessage(error.message || 'Unable to add hall.')
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const changeApplicationStatus = (userId, status) => performAction(
    `/admin/owner-applications/${userId}/status`,
    { status },
    'Owner application updated.'
  )

  const changeHallStatus = (hallId, status) => performAction(
    `/admin/halls/${hallId}/status`,
    { status },
    'Hall status updated.'
  )

  return (
    <main className="management-page">
      <ManagementHeader
        eyebrow="PLATFORM MANAGEMENT"
        title="Admin dashboard"
        description="A single place to review venue partners, approve hall listings, and oversee booking requests."
        portalLabel="PLATFORM ADMIN"
      />

      <nav className="management-tabs" aria-label="Admin dashboard sections">
        <button aria-pressed={activeTab === 'bookings'} className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>
          Bookings <span>{bookings.length}</span>
        </button>
        <button aria-pressed={activeTab === 'applications'} className={activeTab === 'applications' ? 'active' : ''} onClick={() => setActiveTab('applications')}>
          Owner applications <span>{applications.length}</span>
        </button>
        <button aria-pressed={activeTab === 'halls'} className={activeTab === 'halls' ? 'active' : ''} onClick={() => setActiveTab('halls')}>
          Halls <span>{halls.length}</span>
        </button>
      </nav>

      {message && <p className="management-feedback" role="status">{message}</p>}
      {loading ? <p>Loading admin dashboard…</p> : (
        <>
          {activeTab === 'bookings' && (
            <section className="management-section">
              <div className="management-section-heading">
                <div>
                  <span className="management-eyebrow">BOOKING MANAGEMENT</span>
                  <h2>Customer booking requests</h2>
                </div>
              </div>
              {bookings.length === 0 ? <p className="management-empty">No booking requests found.</p> : (
                <div className="management-card-grid">
                  {bookings.map((booking) => (
                    <article className="management-card" key={booking._id}>
                      <div className="management-card-title">
                        <h3>{booking.hallName}</h3>
                        <span className={`management-status status-${booking.status.toLowerCase()}`}>{booking.status}</span>
                      </div>
                      <p><strong>Customer:</strong> {booking.customerName}</p>
                      <p><strong>Email:</strong> {booking.email} · <strong>Phone:</strong> {booking.phone}</p>
                      <p><strong>Event:</strong> {booking.eventType} on {new Date(booking.eventDate).toLocaleDateString('en-IN')}</p>
                      <p><strong>Location:</strong> {booking.location}</p>
                      <p><strong>Guests:</strong> {booking.guests} · <strong>Duration:</strong> {booking.duration} days</p>
                      <p><strong>Total:</strong> ₹{Number(booking.totalPrice).toLocaleString('en-IN')}</p>
                      {booking.status === 'Pending' && (
                        <p><strong>Decision:</strong> Waiting for the hall creator</p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'applications' && (
            <section className="management-section">
              <div className="management-section-heading">
                <div>
                  <span className="management-eyebrow">PARTNER ONBOARDING</span>
                  <h2>Owner applications</h2>
                </div>
                  <p>Approved owners submit halls. Booking requests remain with the owner who created each hall.</p>
              </div>
              {applications.length === 0 ? <p className="management-empty">There are no owner applications awaiting review.</p> : (
                <div className="management-card-grid">
                  {applications.map((application) => (
                    <article className="management-card" key={application._id}>
                      <h3>{application.ownerApplicationBusinessName}</h3>
                      <p><strong>Applicant:</strong> {application.name}</p>
                      <p><strong>Email:</strong> {application.email}</p>
                      <p><strong>Phone:</strong> {application.ownerApplicationPhone}</p>
                      <p>{application.ownerApplicationMessage || 'No additional details supplied.'}</p>
                      <div className="management-actions">
                        <button disabled={submitting} onClick={() => changeApplicationStatus(application._id, 'approved')}>Approve owner</button>
                        <button className="management-danger" disabled={submitting} onClick={() => changeApplicationStatus(application._id, 'rejected')}>Reject</button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'halls' && (
            <section className="management-section">
              <div className="management-section-heading">
                <div>
                  <span className="management-eyebrow">VENUE CATALOG</span>
                  <h2>Manage halls</h2>
                </div>
                <p>Admin-created halls publish immediately. Owner-submitted halls stay hidden until approved.</p>
              </div>

              <div className="management-panel">
                <h3>Add a hall</h3>
                <HallForm onSave={addHall} submitting={submitting} submitLabel="Add and publish hall" />
              </div>

              <div className="management-card-grid management-hall-list">
                {halls.map((hall) => (
                  <article className="management-card" key={hall._id}>
                    <div className="management-card-title">
                      <h3>{hall.name}</h3>
                      <span className={`management-status status-${(hall.status || 'Approved').toLowerCase()}`}>{hall.status || 'Approved'}</span>
                    </div>
                    <p>{hall.location}</p>
                    <p>Capacity: {hall.capacity} · ₹{Number(hall.price).toLocaleString('en-IN')} per day</p>
                    {hall.status === 'Pending' && (
                      <div className="management-actions">
                        <button disabled={submitting} onClick={() => changeHallStatus(hall._id, 'Approved')}>Approve hall</button>
                        <button className="management-danger" disabled={submitting} onClick={() => changeHallStatus(hall._id, 'Rejected')}>Reject</button>
                      </div>
                    )}
                    {hall.createdBy || hall.ownerId ? (
                      <p><strong>Created by:</strong> {hall.ownerId?.name || hall.createdBy?.name || 'Registered owner'}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  )
}

export default AdminDashboard
