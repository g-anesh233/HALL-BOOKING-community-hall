import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import ManagementHeader from '../components/ManagementHeader'
import '../App.css'

function OwnerApplication() {
  const { user, updateUser } = useAuth()
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const applicationStatus = user?.ownerApplicationStatus || 'none'

  const submitApplication = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    setSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('http://localhost:5000/api/auth/owner-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('hallbookToken')}`
        },
        body: JSON.stringify({
          businessName: form.elements.businessName.value,
          phone: form.elements.phone.value,
          message: form.elements.message.value
        })
      })
      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || 'Unable to submit your application.')
        return
      }

      updateUser(data.user)
      setMessage(data.message)
    } catch {
      setMessage('Unable to connect to the server. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="management-page">
      <ManagementHeader
        eyebrow="VENUE PARTNERS"
        title="Bring your venue to HallBook"
        description="Apply to become a venue partner. Our platform team reviews each application before owner tools are enabled."
        portalLabel="PARTNER APPLICATION"
      />

      {applicationStatus === 'pending' ? (
        <section className="management-notice application-status-panel" role="status">
          <span className="application-status-icon" aria-hidden="true">✓</span>
          <div>
            <span className="management-eyebrow">APPLICATION RECEIVED</span>
            <h2>We’re reviewing your details</h2>
            <p>Your application is with the HallBook platform team. You can continue using your customer account while it is reviewed.</p>
          </div>
          <ol className="application-steps">
            <li className="complete"><span>1</span><div><strong>Application submitted</strong><small>Your details are saved</small></div></li>
            <li className="current"><span>2</span><div><strong>Platform review</strong><small>We’re checking your application</small></div></li>
            <li><span>3</span><div><strong>List your halls</strong><small>Available after approval</small></div></li>
          </ol>
        </section>
      ) : applicationStatus === 'approved' || user?.role === 'owner' ? (
        <section className="management-notice application-status-panel" role="status">
          <span className="application-status-icon" aria-hidden="true">✓</span>
          <div>
            <span className="management-eyebrow">PARTNER ACCESS ACTIVE</span>
            <h2>Your venue owner account is approved</h2>
            <p>You can now manage your halls and respond to booking requests.</p>
            <Link className="management-primary-link" to="/owner">Open owner dashboard <span aria-hidden="true">→</span></Link>
          </div>
        </section>
      ) : (
        <section className="management-panel application-form-panel">
          <div className="application-form-intro">
            <span className="management-eyebrow">{applicationStatus === 'rejected' ? 'UPDATE YOUR APPLICATION' : 'BECOME A PARTNER'}</span>
            <h2>{applicationStatus === 'rejected' ? 'Apply again with updated details' : 'Tell us about your venue business'}</h2>
            <p>Share a few details so our team can review your request.</p>
          </div>
          {applicationStatus === 'rejected' && (
            <p className="management-notice-text">Your previous application was not approved. You may submit a new application with updated details.</p>
          )}
          <form className="management-form" onSubmit={submitApplication}>
            <label>
              Business or organization name
              <input name="businessName" required maxLength="120" />
            </label>
            <label>
              Contact phone
              <input name="phone" type="tel" required maxLength="30" />
            </label>
            <label>
              Tell us about your venue business
              <textarea name="message" rows="4" maxLength="1000" placeholder="Include the venue locations you manage." />
            </label>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Send application for review'}
              {!submitting && <span aria-hidden="true">→</span>}
            </button>
            {message && <p className="management-feedback" role="status">{message}</p>}
          </form>
        </section>
      )}
    </main>
  )
}

export default OwnerApplication
