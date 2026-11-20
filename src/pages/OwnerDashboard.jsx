import { useCallback, useEffect, useState } from 'react'
import HallForm from '../components/HallForm'
import ManagementHeader from '../components/ManagementHeader'
import { apiUrl } from '../api'
import '../App.css'

function OwnerDashboard() {
  const [bookings, setBookings] = useState([])
  const [halls, setHalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const loadDashboard = useCallback(async () => {
    const token = localStorage.getItem('hallbookToken')

    try {
      const [bookingResponse, hallResponse] = await Promise.all([
        fetch(apiUrl('/owner/bookings'), {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(apiUrl('/halls/mine'), {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])
      const [bookingData, hallData] = await Promise.all([
        bookingResponse.json(),
        hallResponse.json()
      ])

      if (!bookingResponse.ok || !hallResponse.ok) {
        throw new Error(bookingData.message || hallData.message || 'Failed to load owner dashboard.')
      }

      setBookings(bookingData)
      setHalls(hallData)
    } catch (error) {
      setMessage(error.message || 'Unable to connect to the server.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const initialLoad = window.setTimeout(loadDashboard, 0)
    return () => window.clearTimeout(initialLoad)
  }, [loadDashboard])

  const addHall = async (hallInput) => {
    setSubmitting(true)
    setMessage('')

    try {
      const response = await fetch(apiUrl('/halls'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('hallbookToken')}`
        },
        body: JSON.stringify(hallInput)
      })
      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || 'Unable to submit hall.')
        return false
      }

      setHalls((current) => [data.hall, ...current])
      setMessage(data.message)
      return true
    } catch {
      setMessage('Unable to connect to the server.')
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const updateBooking = async (bookingId, status) => {
    setMessage('')
    setSubmitting(true)

    try {
      const response = await fetch(apiUrl(`/owner/bookings/${bookingId}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('hallbookToken')}`
        },
        body: JSON.stringify({ status })
      })
      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || 'Unable to update booking.')
        return
      }

      setBookings((current) => current.map((booking) => (
        booking._id === bookingId ? data.booking : booking
      )))
      setMessage(data.message)
    } catch {
      setMessage('Unable to connect to the server.')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteHall = async (hallId, hallName) => {
    if (!window.confirm(`Delete "${hallName}"? This will also remove its booking requests.`)) {
      return
    }

    setMessage('')
    setSubmitting(true)

    try {
      const response = await fetch(apiUrl(`/halls/${hallId}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('hallbookToken')}`
        }
      })
      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || 'Unable to delete hall.')
        return
      }

      setHalls((current) => current.filter((hall) => hall._id !== hallId))
      setBookings((current) => current.filter((booking) => (
        String(booking.hall?._id || booking.hall) !== hallId
      )))
      setMessage(data.message)
    } catch {
      setMessage('Unable to connect to the server.')
    } finally {
      setSubmitting(false)
    }
  }

  const pendingBookings = bookings.filter((booking) => booking.status === 'Pending').length

  return (
    <main className="management-page">
      <ManagementHeader
        eyebrow="VENUE OWNER"
        title="Owner dashboard"
        description="Manage your venue listings, review incoming requests, and keep every hall up to date."
        portalLabel="VENUE OWNER"
      />

      <div className="management-stats">
        <article>
          <span className="management-stat-label">YOUR HALLS</span>
          <strong>{halls.length}</strong>
          <small>Listings you manage</small>
        </article>
        <article>
          <span className="management-stat-label">BOOKING REQUESTS</span>
          <strong>{bookings.length}</strong>
          <small>Across your approved halls</small>
        </article>
        <article className={pendingBookings ? 'management-stat-attention' : ''}>
          <span className="management-stat-label">NEEDS YOUR RESPONSE</span>
          <strong>{pendingBookings}</strong>
          <small>{pendingBookings ? 'Pending requests to review' : 'You are all caught up'}</small>
        </article>
      </div>

      {message && <p className="management-feedback" role="status">{message}</p>}
      {loading ? <p>Loading your venue dashboard…</p> : (
        <>
          <nav className="management-quick-links" aria-label="Owner dashboard shortcuts">
            <a href="#owner-bookings">Booking inbox <span aria-hidden="true">↓</span></a>
            <a href="#owner-listings">Your halls <span aria-hidden="true">↓</span></a>
            <a href="#owner-add-hall">Submit a hall <span aria-hidden="true">↓</span></a>
          </nav>

          <section className="management-section" id="owner-bookings">
            <div className="management-section-heading">
              <div>
                <span className="management-eyebrow">BOOKING INBOX</span>
                <h2>Requests for your halls</h2>
              </div>
              <p>Only bookings for halls assigned to your account appear here.</p>
            </div>
            {bookings.length === 0 ? <p className="management-empty">No booking requests yet. New requests for your approved halls will appear here.</p> : (
              <div className="management-card-grid">
                {bookings.map((booking) => (
                  <article className="management-card owner-booking-card" key={booking._id}>
                    <div className="management-card-title">
                      <div>
                        <span className="management-card-kicker">BOOKING REQUEST</span>
                        <h3>{booking.hallName}</h3>
                      </div>
                      <span className={`management-status status-${booking.status.toLowerCase()}`}>{booking.status}</span>
                    </div>
                    <div className="owner-booking-details">
                      <p><span>Customer</span><strong>{booking.customerName}</strong></p>
                      <p><span>Event</span><strong>{booking.eventType} · {new Date(booking.eventDate).toLocaleDateString('en-IN')}</strong></p>
                      <p><span>Contact</span><strong>{booking.email}</strong></p>
                      <p><span>Guests / duration</span><strong>{booking.guests} guests · {booking.duration} days</strong></p>
                    </div>
                    <div className="owner-booking-total">
                      <span>Estimated booking value</span>
                      <strong>₹{Number(booking.totalPrice).toLocaleString('en-IN')}</strong>
                    </div>
                    {booking.status === 'Pending' && (
                      <div className="management-actions">
                        <button type="button" disabled={submitting} onClick={() => updateBooking(booking._id, 'Approved')}>
                          {submitting ? 'Updating…' : 'Approve request'}
                        </button>
                        <button className="management-danger" type="button" disabled={submitting} onClick={() => updateBooking(booking._id, 'Rejected')}>
                          Reject
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="management-section" id="owner-listings">
            <div className="management-section-heading">
              <div>
                <span className="management-eyebrow">YOUR LISTINGS</span>
                <h2>Halls and review status</h2>
              </div>
              <p>Approved halls are visible to customers. New submissions are reviewed by the HallBook team.</p>
            </div>
            {halls.length === 0 ? <p className="management-empty">You have not submitted any halls yet.</p> : (
              <div className="management-card-grid">
                {halls.map((hall) => (
                  <article className="management-card owner-hall-card" key={hall._id}>
                    <img src={hall.image} alt="" />
                    <div className="management-card-title">
                      <h3>{hall.name}</h3>
                      <span className={`management-status status-${hall.status.toLowerCase()}`}>{hall.status}</span>
                    </div>
                    <p>{hall.location}</p>
                    <div className="owner-hall-facts">
                      <span>Capacity <strong>{hall.capacity}</strong></span>
                      <span>Per day <strong>₹{Number(hall.price).toLocaleString('en-IN')}</strong></span>
                    </div>
                    <div className="management-actions owner-hall-actions">
                      <button
                        className="management-danger"
                        type="button"
                        disabled={submitting}
                        onClick={() => deleteHall(hall._id, hall.name)}
                      >
                        {submitting ? 'Deleting…' : 'Delete hall'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="management-section" id="owner-add-hall">
            <div className="management-section-heading">
              <div>
                <span className="management-eyebrow">GROW YOUR CATALOG</span>
                <h2>Submit another hall</h2>
              </div>
              <p>Each new venue is checked by a platform admin before it appears in Explore Halls.</p>
            </div>
            <div className="management-panel">
              <HallForm onSave={addHall} submitting={submitting} />
            </div>
          </section>
        </>
      )}
    </main>
  )
}

export default OwnerDashboard
