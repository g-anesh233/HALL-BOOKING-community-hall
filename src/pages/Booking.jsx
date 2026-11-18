import { useState } from 'react'
import '../App.css'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import LogoutButton from '../components/LogoutButton'
import { useAuth } from '../hooks/useAuth'

function Booking() {
  const location = useLocation()
  const navigate = useNavigate()
  const { clearSession } = useAuth()
  const hall = location.state?.hall
  const [profileOpen, setProfileOpen] = useState(false)
  const [duration, setDuration] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [booking, setBooking] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const currentDate = new Date()
  currentDate.setMinutes(currentDate.getMinutes() - currentDate.getTimezoneOffset())
  const today = currentDate.toISOString().split('T')[0]

  const pricePerDay = Number(String(hall?.price ?? '').replace(/[^\d.]/g, ''))
  const durationInDays = Number(duration)
  const estimatedTotal = pricePerDay > 0 && durationInDays > 0
    ? pricePerDay * durationInDays
    : null

  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const token = localStorage.getItem('hallbookToken')

    if (!token) {
      setErrorMessage('Please sign in again before submitting a booking request.')
      return
    }

    if (!hall?._id) {
      setErrorMessage('This venue is unavailable for online booking. Please select another hall.')
      return
    }

    setErrorMessage('')
    setSubmitting(true)

    const form = event.currentTarget
    const bookingData = {
      hallId: hall._id,
      customerName: form.elements.fullName.value,
      email: form.elements.email.value,
      phone: form.elements.phone.value,
      eventType: form.elements.eventType.value,
      eventDate: form.elements.eventDate.value,
      guests: form.elements.guests.value,
      duration: form.elements.duration.value,
      requirements: form.elements.requirements.value
    }

    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.message || 'Booking failed. Please try again.')
        return
      }

      setBooking(data.booking)
    } catch {
      setErrorMessage('Unable to connect to the server. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

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

      <main className="booking-page">
        <header className="booking-page-heading">
          <div>
            <span className="booking-page-eyebrow">BOOKING REQUEST</span>
            <h1>Plan your event</h1>
            <p>Share a few details and we’ll send your request to the venue.</p>
          </div>
          <Link to="/explore-halls" className="booking-back-link">
            ← Back to halls
          </Link>
        </header>

        {!hall ? (
          <section className="booking-page-empty">
            <h2>Select a venue to get started</h2>
            <p>Choose a hall first, then come back to complete your booking request.</p>
            <Link to="/explore-halls" className="booking-submit-link">
              Explore halls <span aria-hidden="true">→</span>
            </Link>
          </section>
        ) : booking ? (
          <section className="booking-confirmation" role="status">
            <span className="booking-confirmation-icon" aria-hidden="true">✓</span>
            <span className="booking-page-eyebrow">REQUEST RECEIVED</span>
            <h2>Your booking request is in.</h2>
            <p>
              We’ve received your request for <strong>{hall.name}</strong>.
              You can follow its status from My Bookings.
            </p>
            <div className="booking-confirmation-reference">
              <span>Booking reference</span>
              <strong>{booking._id}</strong>
            </div>
            <div className="booking-confirmation-actions">
              <Link to="/my-bookings" className="booking-submit-link">
                View my bookings
              </Link>
              <Link to="/explore-halls" className="booking-secondary-link">
                Explore more halls
              </Link>
            </div>
          </section>
        ) : (
          <div className="booking-layout">
            <form className="booking-form booking-request-form" onSubmit={handleSubmit}>
              <fieldset className="booking-form-section">
                <legend>Personal information</legend>
                <div className="booking-fields-grid">
                  <div className="booking-field">
                    <label htmlFor="booking-full-name">Full name</label>
                    <input
                      id="booking-full-name"
                      type="text"
                      name="fullName"
                      autoComplete="name"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="booking-field">
                    <label htmlFor="booking-email">Email address</label>
                    <input
                      id="booking-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="booking-field">
                    <label htmlFor="booking-phone">Phone number</label>
                    <input
                      id="booking-phone"
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      title="Enter a valid 10-digit phone number"
                      placeholder="10-digit phone number"
                      required
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset className="booking-form-section">
                <legend>Event information</legend>
                <div className="booking-fields-grid">
                  <div className="booking-field">
                    <label htmlFor="booking-event-type">Event type</label>
                    <select id="booking-event-type" name="eventType" required defaultValue="">
                      <option value="" disabled>Select an event type</option>
                      <option value="Wedding">Wedding</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Engagement">Engagement</option>
                      <option value="Reception">Reception</option>
                      <option value="Business Meeting">Business meeting</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="booking-field">
                    <label htmlFor="booking-event-date">Event date</label>
                    <input
                      id="booking-event-date"
                      type="date"
                      name="eventDate"
                      min={today}
                      required
                    />
                  </div>
                  <div className="booking-field">
                    <label htmlFor="booking-guests">Expected guests</label>
                    <input
                      id="booking-guests"
                      type="number"
                      name="guests"
                      min="1"
                      placeholder="Number of guests"
                      required
                    />
                  </div>
                  <div className="booking-field">
                    <label htmlFor="booking-duration">Duration</label>
                    <div className="booking-duration-field">
                      <input
                        id="booking-duration"
                        type="number"
                        name="duration"
                        min="1"
                        value={duration}
                        onChange={(event) => setDuration(event.target.value)}
                        placeholder="Number of days"
                        required
                      />
                      <span>days</span>
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset className="booking-form-section">
                <legend>Additional requests <span>(optional)</span></legend>
                <div className="booking-field">
                  <label htmlFor="booking-requirements">Anything else the venue should know?</label>
                  <textarea
                    id="booking-requirements"
                    name="requirements"
                    placeholder="Share accessibility needs, setup preferences, or other details."
                    rows="4"
                  />
                </div>
              </fieldset>

              {errorMessage && (
                <p className="booking-form-error" role="alert">{errorMessage}</p>
              )}

              <button
                className="booking-submit-button"
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Sending request…' : 'Submit booking request'}
              </button>
              <p className="booking-form-note">
                Your request is subject to venue approval. No payment is taken here.
              </p>
            </form>

            <aside className="booking-summary-card" aria-label="Booking summary">
              <span className="booking-summary-eyebrow">YOUR SELECTED VENUE</span>
              <img src={hall.image} alt={hall.name} />
              <h2>{hall.name}</h2>
              <p className="booking-summary-location">{hall.location}</p>
              <div className="booking-summary-row">
                <span>Capacity</span>
                <strong>{hall.capacity}</strong>
              </div>
              <div className="booking-summary-row">
                <span>Price per day</span>
                <strong>{hall.price}</strong>
              </div>
              <div className="booking-summary-total">
                <span>Estimated total</span>
                <strong>
                  {estimatedTotal === null
                    ? 'Add duration'
                    : `₹${estimatedTotal.toLocaleString('en-IN')}`}
                </strong>
              </div>
              <p className="booking-summary-note">
                The final amount may depend on the venue’s confirmation.
              </p>
            </aside>
          </div>
        )}
      </main>
    </>
  )
}

export default Booking
