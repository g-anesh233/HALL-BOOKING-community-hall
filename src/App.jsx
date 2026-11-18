import Register from './pages/Register'
import Login from './pages/Login'
import Booking from './pages/Booking'
import HallDetails from './pages/HallDetails'
import './App.css'
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import ExploreHalls from './pages/ExploreHalls'
import MyBookings from './pages/MyBookings'
import AdminDashboard from './pages/AdminDashboard'
import OwnerDashboard from './pages/OwnerDashboard'
import OwnerApplication from './pages/OwnerApplication'
import PersonalDetails from './pages/PersonalDetails'
import LogoutButton from './components/LogoutButton'
import { useState } from 'react'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <p className="management-loading">Checking your account…</p>
  }

  if (!user || !localStorage.getItem('hallbookToken')) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
function AdminRoute({ children }) {
  const { user, loading, verified, refreshUser } = useAuth()

  if (loading) {
    return <p className="management-loading">Checking your account…</p>
  }

  if (!user || !localStorage.getItem('hallbookToken')) {
    return <Navigate to="/login" replace />
  }

  if (!verified) {
    return (
      <main className="management-page">
        <p role="alert">Unable to verify your admin access. Check your connection and try again.</p>
        <button type="button" onClick={refreshUser}>Retry</button>
      </main>
    )
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
function OwnerRoute({ children }) {
  const { user, loading, verified, refreshUser } = useAuth()

  if (loading) {
    return <p className="management-loading">Checking your account…</p>
  }

  if (!user || !localStorage.getItem('hallbookToken')) {
    return <Navigate to="/login" replace />
  }

  if (!verified) {
    return (
      <main className="management-page">
        <p role="alert">Unable to verify your owner access. Check your connection and try again.</p>
        <button type="button" onClick={refreshUser}>Retry</button>
      </main>
    )
  }

  return user.role === 'owner'
    ? children
    : <Navigate to="/dashboard" replace />
}
function Home() {
  return (
    <div className="landing-page">
      <nav className="landing-navbar">
        <Link to="/" className="logo">
          Hall<span>Book</span>
        </Link>
        <div className="landing-nav-actions">
          <a href="#about">About</a>
          <Link to="/login" className="landing-nav-login">Sign in</Link>
          <Link to="/register" className="landing-nav-register">Get started</Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <span className="landing-eyebrow">VENUES FOR MOMENTS THAT MATTER</span>
          <h1>Find a place to bring everyone together.</h1>
          <p>
            Discover community halls for weddings, celebrations, meetings,
            and all the moments worth sharing.
          </p>

          <div className="landing-buttons">
            <Link to="/register" className="landing-cta-primary">
              Find your hall
            </Link>
            <a href="#about" className="landing-cta-secondary">
              How HallBook works
            </a>
          </div>

          <div className="landing-proof">
            <span className="landing-proof-mark" aria-hidden="true">✓</span>
            <span>Browse venues, compare details, and send a booking request.</span>
          </div>
        </div>

        <div
          className="landing-hero-visual"
          role="img"
          aria-label="A beautifully arranged event hall"
        >
          <div className="landing-hero-note">
            <span>Make planning feel simple</span>
            <strong>Your next gathering starts here.</strong>
          </div>
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="landing-section-inner">
          <div className="about-intro">
            <span className="landing-eyebrow">ABOUT HALLBOOK</span>
            <h2>A better way to find the right space.</h2>
            <p>
              HallBook helps you explore community venues and plan your event
              with the important details in one place.
            </p>
          </div>

          <div className="about-features">
            <article className="about-feature">
              <span className="about-feature-number">01</span>
              <h3>Explore venues</h3>
              <p>Browse halls in different locations and find options for your event.</p>
            </article>
            <article className="about-feature">
              <span className="about-feature-number">02</span>
              <h3>Compare details</h3>
              <p>Review location, capacity, facilities, and pricing before you choose.</p>
            </article>
            <article className="about-feature">
              <span className="about-feature-number">03</span>
              <h3>Request a booking</h3>
              <p>Share your event details and keep track of your booking requests.</p>
            </article>
          </div>

          <div className="how-it-works">
            <div>
              <span className="landing-eyebrow">A SIMPLE PROCESS</span>
              <h2>From search to celebration.</h2>
            </div>
            <ol className="how-it-works-steps">
              <li><span>1</span><div><strong>Search</strong><p>Start with the city where you need a hall.</p></div></li>
              <li><span>2</span><div><strong>Choose</strong><p>Compare the venue details and pick your favorite.</p></div></li>
              <li><span>3</span><div><strong>Request</strong><p>Send your event information to request a booking.</p></div></li>
            </ol>
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <div>
          <span className="landing-eyebrow">READY WHEN YOU ARE</span>
          <h2>Let’s find a place for your next occasion.</h2>
          <p>Create an account to start exploring community halls.</p>
        </div>
        <Link to="/register" className="landing-cta-primary">
          Get started
        </Link>
      </section>
    </div>
  )
}
function UserHome() {
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()
  const { user, clearSession } = useAuth()

  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="dashboard-page">

      <nav className="dashboard-navbar">
        <Link to="/dashboard" className="logo dashboard-logo">
          Hall<span>Book</span>
        </Link>

        <ul className="nav-links">
          <li><Link to="/dashboard">Home</Link></li>
          <li><Link to="/explore-halls">Explore Halls</Link></li>
          {user?.role === 'admin' && (
            <li><Link to="/admin">Admin Dashboard</Link></li>
          )}
          {user?.role === 'owner' && (
            <li><Link to="/owner">Owner Dashboard</Link></li>
          )}
          {user?.role === 'user' && (
            <li>
              <Link to="/owner-application">
                {user.ownerApplicationStatus === 'pending' ? 'Application status' : 'List your venue'}
              </Link>
            </li>
          )}
        </ul>

        <div className="profile-container">
  <button
    className="profile-btn"
    onClick={() => setProfileOpen(!profileOpen)}
  >
    👤 Profile ▾
  </button>

  {profileOpen && (
    <div className="profile-dropdown">
      <Link to="/personal-details">Personal Details</Link>
      <Link to="/my-bookings">My Bookings</Link>
      {user?.role === 'owner' && <Link to="/owner">Owner Dashboard</Link>}
      {user?.role === 'user' && (
        <Link to="/owner-application">
          {user.ownerApplicationStatus === 'pending' ? 'Owner application status' : 'Become a venue partner'}
        </Link>
      )}
      <hr />
      <LogoutButton onLogout={handleLogout} />
    </div>
  )}
</div>
      </nav>

      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <span className="hero-label">
            WELCOME TO HALLBOOK
          </span>
          <h1>
            Find the right venue for your next occasion.
          </h1>
          <p>
            Explore community halls, compare the details, and request a
            booking—all in one place.
          </p>
          <Link to="/explore-halls" className="dashboard-explore-btn">
            Explore halls <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="dashboard-quick-actions" aria-label="Quick actions">
        <Link to="/explore-halls" className="dashboard-action-card">
          <span className="dashboard-action-icon" aria-hidden="true">⌕</span>
          <span className="dashboard-action-copy">
            <span className="dashboard-action-label">START PLANNING</span>
            <strong>Explore community halls</strong>
            <span>Compare venues, capacity, and pricing.</span>
          </span>
          <span className="dashboard-action-arrow" aria-hidden="true">→</span>
        </Link>

        <Link to="/my-bookings" className="dashboard-action-card">
          <span className="dashboard-action-icon dashboard-booking-icon" aria-hidden="true">✓</span>
          <span className="dashboard-action-copy">
            <span className="dashboard-action-label">YOUR REQUESTS</span>
            <strong>View my bookings</strong>
            <span>Check the status of your booking requests.</span>
          </span>
          <span className="dashboard-action-arrow" aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="dashboard-categories">
        <div className="dashboard-section-heading">
          <span>FIND YOUR FIT</span>
          <h2>A hall for every occasion</h2>
          <p>Start with the kind of gathering you’re planning.</p>
        </div>

        <div className="category-grid">
          <Link to="/explore-halls" className="category-card">
            <span className="category-card-icon" aria-hidden="true">01</span>
            <h3>Weddings</h3>
            <p>Find a welcoming space for your celebration.</p>
            <span className="category-card-link">Explore halls <span aria-hidden="true">→</span></span>
          </Link>
          <Link to="/explore-halls" className="category-card">
            <span className="category-card-icon" aria-hidden="true">02</span>
            <h3>Parties</h3>
            <p>Discover venues for birthdays and special gatherings.</p>
            <span className="category-card-link">Explore halls <span aria-hidden="true">→</span></span>
          </Link>
          <Link to="/explore-halls" className="category-card">
            <span className="category-card-icon" aria-hidden="true">03</span>
            <h3>Meetings</h3>
            <p>Browse spaces for work events and conferences.</p>
            <span className="category-card-link">Explore halls <span aria-hidden="true">→</span></span>
          </Link>
          <Link to="/explore-halls" className="category-card">
            <span className="category-card-icon" aria-hidden="true">04</span>
            <h3>Community events</h3>
            <p>Bring people together for local events and activities.</p>
            <span className="category-card-link">Explore halls <span aria-hidden="true">→</span></span>
          </Link>
        </div>
      </section>

    </div>
  )
}
function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
  <Route
    path="/explore-halls"
    element={
      <ProtectedRoute>
        <ExploreHalls />
      </ProtectedRoute>
    }
  />

  <Route
    path="/hall-details"
    element={
      <ProtectedRoute>
        <HallDetails />
      </ProtectedRoute>
    }
  />
<Route path="/booking" element={
  <ProtectedRoute><Booking /></ProtectedRoute>
} />
<Route
  path="/my-bookings"
  element={
    <ProtectedRoute>
      <MyBookings />
    </ProtectedRoute>
  }
/>
<Route
  path="/personal-details"
  element={
    <ProtectedRoute>
      <PersonalDetails />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  }
/>
<Route
  path="/owner-application"
  element={
    <ProtectedRoute>
      <OwnerApplication />
    </ProtectedRoute>
  }
/>
<Route
  path="/owner"
  element={
    <OwnerRoute>
      <OwnerDashboard />
    </OwnerRoute>
  }
/>
  <Route path="/" element={<Home />} />
  <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <UserHome />
    </ProtectedRoute>
  }
/>

  <Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />

</Routes>

    </BrowserRouter>
    </AuthProvider>
  )
}

export default App