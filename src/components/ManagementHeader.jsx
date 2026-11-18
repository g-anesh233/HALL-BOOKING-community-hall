import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function ManagementHeader({ eyebrow, title, description, portalLabel }) {
  const { user } = useAuth()
  const initials = user?.name?.trim()
    ? user.name.trim().charAt(0).toUpperCase()
    : 'H'

  return (
    <>
      <nav className="management-topbar" aria-label="Management navigation">
        <Link to="/dashboard" className="management-brand">
          <span className="management-brand-mark" aria-hidden="true">H</span>
          <span className="management-brand-copy">
            <strong>Hall<span>Book</span></strong>
            <small>VENUE MANAGEMENT</small>
          </span>
        </Link>

        <div className="management-topbar-actions">
          <div className="management-account">
            <span className="management-account-avatar" aria-hidden="true">{initials}</span>
            <span className="management-account-copy">
              <strong>{user?.name || 'HallBook account'}</strong>
              <small>{portalLabel}</small>
            </span>
          </div>
          <Link className="management-back-link" to="/dashboard">
            <span aria-hidden="true">←</span>
            Back to dashboard
          </Link>
        </div>
      </nav>

      <header className="management-hero">
        <div>
          <span className="management-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="management-hero-mark" aria-hidden="true">
          <span>HB</span>
        </div>
      </header>
    </>
  )
}

export default ManagementHeader
