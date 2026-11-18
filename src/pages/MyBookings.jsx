import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../App.css'
import LogoutButton from '../components/LogoutButton'
import { useAuth } from '../hooks/useAuth'

function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [refreshKey, setRefreshKey] = useState(0)

  const navigate = useNavigate()
  const { clearSession } = useAuth()

  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    let active = true

    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('hallbookToken')

        if (!token) {
          setMessage('Your session has expired. Please sign in again.')
          return
        }

        const response = await fetch(
          'http://localhost:5000/api/bookings/my-bookings',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const data = await response.json()

        if (!response.ok) {
          if (active) {
            setMessage(data.message || 'Failed to load bookings.')
          }
          return
        }

        if (!Array.isArray(data)) {
          throw new Error('Unexpected bookings response.')
        }

        if (active) {
          setBookings(data)
        }
      } catch {
        if (active) {
          setMessage('Unable to load your bookings. Check your connection and try again.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchBookings()
    return () => {
      active = false
    }
  }, [refreshKey])

  const filteredBookings = statusFilter === 'all'
    ? bookings
    : bookings.filter((booking) => booking.status?.toLowerCase() === statusFilter)

  return (
    <>
      <nav className="dashboard-navbar">
        <Link to="/dashboard" className="logo dashboard-logo">
          Hall<span>Book</span>
        </Link>

        <ul className="nav-links">
          <li><Link to="/dashboard">Home</Link></li>
          <li><Link to="/explore-halls">Explore Halls</Link></li>
        </ul>

        <div className="profile-container">
          <button
            className="profile-btn"
            type="button"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen(!profileOpen)}
          >
            👤 Profile ▾
          </button>

          {profileOpen && (
            <div className="profile-dropdown">
              <Link to="/personal-details">Personal Details</Link>
              <Link to="/my-bookings">My Bookings</Link>
              <hr />
              <LogoutButton onLogout={handleLogout} />
            </div>
          )}
        </div>
      </nav>

      <main className="my-bookings-page">
        <header className="my-bookings-heading">
          <div>
            <span className="my-bookings-eyebrow">YOUR ACCOUNT</span>
            <h1>My bookings</h1>
            <p>Review your venue requests, event details, and booking status.</p>
          </div>
          <Link to="/explore-halls" className="bookings-explore-link">
            Explore halls <span aria-hidden="true">→</span>
          </Link>
        </header>

        {message ? (
          <section className="booking-state booking-error" role="alert">
            <h2>We couldn’t load your bookings</h2>
            <p>{message}</p>
            <button
              type="button"
              onClick={() => {
                setMessage('')
                setLoading(true)
                setRefreshKey((key) => key + 1)
              }}
            >
              Try again
            </button>
          </section>
        ) : loading ? (
          <div className="booking-state booking-loading" role="status">
            <span className="booking-spinner" aria-hidden="true" />
            <p>Loading your bookings…</p>
          </div>
        ) : bookings.length === 0 ? (
          <section className="booking-state booking-empty">
            <span className="booking-empty-icon" aria-hidden="true">▤</span>
            <h2>No booking requests yet</h2>
            <p>When you request a venue, its details and status will appear here.</p>
            <Link to="/explore-halls" className="bookings-explore-link">
              Explore halls <span aria-hidden="true">→</span>
            </Link>
          </section>
        ) : (
          <>
            <div className="bookings-toolbar">
              <p>
                <strong>{bookings.length}</strong>{' '}
                {bookings.length === 1 ? 'booking request' : 'booking requests'}
              </p>
              <div>
                <label htmlFor="booking-status-filter">Status</label>
                <select
                  id="booking-status-filter"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="all">All bookings</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {filteredBookings.length > 0 ? (
              <div className="my-bookings-list">
                {filteredBookings.map((booking) => {
                  const status = booking.status || 'Pending'
                  const statusClass = status.toLowerCase()
                  const eventDate = new Date(booking.eventDate)
                  const formattedDate = Number.isNaN(eventDate.getTime())
                    ? 'Date not available'
                    : eventDate.toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })

                  return (
                    <article className="booking-card" key={booking._id}>
                      <div className="booking-card-header">
                        <div>
                          <span className="booking-card-eyebrow">VENUE</span>
                          <h2>{booking.hallName}</h2>
                          <p className="booking-location">{booking.location}</p>
                        </div>
                        <span className={`booking-status status-${statusClass}`}>
                          {status}
                        </span>
                      </div>

                      <div className="booking-card-details">
                        <div>
                          <span>Event</span>
                          <strong>{booking.eventType}</strong>
                        </div>
                        <div>
                          <span>Event date</span>
                          <strong>{formattedDate}</strong>
                        </div>
                        <div>
                          <span>Guests</span>
                          <strong>{booking.guests}</strong>
                        </div>
                        <div>
                          <span>Duration</span>
                          <strong>{booking.duration} {Number(booking.duration) === 1 ? 'day' : 'days'}</strong>
                        </div>
                      </div>

                      <div className="booking-card-total">
                        <span>Total estimated amount</span>
                        <strong>
                          ₹{Number(booking.totalPrice || 0).toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <section className="booking-state booking-empty">
                <h2>No {statusFilter} bookings</h2>
                <p>Try another status filter to see your requests.</p>
                <button type="button" onClick={() => setStatusFilter('all')}>
                  Show all bookings
                </button>
              </section>
            )}
          </>
        )}
      </main>
    </>
  )
}

export default MyBookings