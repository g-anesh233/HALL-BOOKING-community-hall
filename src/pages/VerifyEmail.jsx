import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiUrl } from '../api'

function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [message, setMessage] = useState(
    token ? 'Verifying your email address…' : 'This verification link is invalid or has expired.'
  )
  const [verified, setVerified] = useState(false)
  const [failed, setFailed] = useState(!token)
  const requestStarted = useRef(false)

  useEffect(() => {
    if (!token) {
      return
    }

    if (requestStarted.current) {
      return
    }
    requestStarted.current = true

    fetch(apiUrl('/auth/verify-email'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message || 'Unable to verify your email.')
        }
        setVerified(true)
        setMessage(data.message)
      })
      .catch((error) => {
        setFailed(true)
        setMessage(error.message || 'Unable to connect to server. Please try again.')
      })
  }, [token])

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
            <span className="auth-eyebrow">EMAIL VERIFICATION</span>
            <h1>{verified ? 'Email verified' : 'Verify your email'}</h1>
            <p role={failed ? 'alert' : 'status'}>{message}</p>
          </div>
          {verified && (
            <Link to="/login" className="auth-verification-link">Sign in</Link>
          )}
        </section>
      </main>
    </>
  )
}

export default VerifyEmail
