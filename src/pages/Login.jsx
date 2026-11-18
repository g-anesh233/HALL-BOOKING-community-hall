import { useState } from 'react'
import '../App.css'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { apiUrl } from '../api'

function Login() {
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { setSession } = useAuth()

 const handleLogin = async (e) => {
  e.preventDefault()

  const email = e.target.email.value
  const password = e.target.password.value

  try {
    const response = await fetch(apiUrl('/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      setMessage(data.message)
      return
    }

    setSession(data.token, data.user)

    const destination = location.state?.from?.pathname || '/dashboard'
    navigate(destination, { replace: true })
  } catch {
    setMessage('Unable to connect to server. Please try again.')
  }
}
  return (
    <>
      <nav className="auth-navbar">
        <Link to="/" className="auth-logo" aria-label="HallBook home">
          Hall<span>Book</span>
        </Link>
        <Link to="/" className="auth-back-link">← Back to Home</Link>
      </nav>

      <main className="auth-page auth-screen">
        <section className="auth-card">
          <div className="auth-card-heading">
            <span className="auth-eyebrow">WELCOME BACK</span>
            <h1>Sign in to HallBook</h1>
            <p>Access your bookings and discover your next venue.</p>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                name="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit">Sign in</button>

            {message && <p className="auth-message" role="alert">{message}</p>}
            <p className="auth-switch">
              New to HallBook? <Link to="/register">Create an account</Link>
            </p>
          </form>
        </section>
      </main>
    </>
  )
}

export default Login