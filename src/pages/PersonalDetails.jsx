import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../App.css'
import LogoutButton from '../components/LogoutButton'
import { useAuth } from '../hooks/useAuth'

function readUserDetails() {
  try {
    const user = JSON.parse(localStorage.getItem('hallbookUser') || '{}')
    return user && typeof user === 'object' ? user : {}
  } catch {
    return {}
  }
}

function PersonalDetails() {
  const [profileOpen, setProfileOpen] = useState(false)
  const { user: currentUser, clearSession } = useAuth()
  const [cachedUser] = useState(readUserDetails)
  const user = currentUser || cachedUser
  const navigate = useNavigate()
  const displayName = typeof user.name === 'string' && user.name.trim()
    ? user.name.trim()
    : 'HallBook member'
  const initials = displayName === 'HallBook member'
    ? 'H'
    : displayName.charAt(0).toUpperCase()

  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
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

      <main className="personal-details-page">
        <header className="personal-details-heading">
          <div>
            <span className="personal-details-eyebrow">YOUR ACCOUNT</span>
            <h1>Personal details</h1>
            <p>View the information connected to your HallBook account.</p>
          </div>
          <Link to="/my-bookings" className="personal-details-bookings-link">
            My bookings <span aria-hidden="true">→</span>
          </Link>
        </header>

        <section className="personal-details-profile">
          <div className="personal-details-avatar" aria-hidden="true">
            {initials}
          </div>
          <div>
            <span className="personal-details-eyebrow">HALLBOOK ACCOUNT</span>
            <h2>{displayName}</h2>
            <p>{user.email || 'Email not available'}</p>
          </div>
        </section>

        <section className="personal-details-card">
          <div className="personal-details-card-heading">
            <h2>Account information</h2>
            <p>Your password stays private and is never shown here.</p>
          </div>

          <div className="personal-detail-row">
            <div>
              <span>Full name</span>
              <p>{user.name || 'Not available'}</p>
            </div>
            <span className="personal-detail-symbol" aria-hidden="true">01</span>
          </div>

          <div className="personal-detail-row">
            <div>
              <span>Email address</span>
              <p>{user.email || 'Not available'}</p>
            </div>
            <span className="personal-detail-symbol" aria-hidden="true">02</span>
          </div>

          <div className="personal-detail-row">
            <div>
              <span>Password</span>
              <p className="password-hidden" aria-label="Password hidden">
                ••••••••
              </p>
              <small className="password-security-note">
                Passwords are securely stored and cannot be viewed.
              </small>
            </div>
            <span className="personal-detail-symbol" aria-hidden="true">03</span>
          </div>

          <div className="personal-details-logout">
            <div>
              <strong>Finished for now?</strong>
              <span>Log out securely from this device.</span>
            </div>
            <LogoutButton onLogout={handleLogout} />
          </div>
        </section>
      </main>
    </>
  )
}

export default PersonalDetails
