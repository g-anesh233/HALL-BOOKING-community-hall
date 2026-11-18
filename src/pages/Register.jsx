import { useState } from 'react'
import '../App.css'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function Register() {
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const { setSession } = useAuth()

const handleRegister = async (e) => {
  e.preventDefault()

  const name = e.target.name.value
  const email = e.target.email.value
  const password = e.target.password.value

  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      setMessage(data.message)
      return
    }

    setSession(data.token, data.user)

    navigate('/dashboard', { replace: true })

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
            <span className="auth-eyebrow">GET STARTED</span>
            <h1>Create your account</h1>
            <p>Join HallBook to find and request the right venue.</p>
          </div>

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="auth-field">
              <label htmlFor="register-name">Full name</label>
              <input
                id="register-name"
                type="text"
                name="name"
                placeholder="Your full name"
                autoComplete="name"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="register-email">Email address</label>
              <input
                id="register-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                name="password"
                placeholder="Create a password"
                autoComplete="new-password"
                required
              />
            </div>

            <button type="submit">Create account</button>

            {message && <p className="auth-message" role="alert">{message}</p>}
            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </form>
        </section>
      </main>
    </>
  )
}

export default Register