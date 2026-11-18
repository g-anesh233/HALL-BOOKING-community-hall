import { useState } from 'react'
import { createPortal } from 'react-dom'

function LogoutButton({ onLogout }) {
  const [confirming, setConfirming] = useState(false)

  const confirmLogout = () => {
    setConfirming(false)
    onLogout()
  }

  return (
    <>
      <button
        className="logout-trigger"
        type="button"
        onClick={() => setConfirming(true)}
      >
        Logout
      </button>

      {confirming && createPortal(
        <div className="logout-modal-backdrop">
          <section
            className="logout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
          >
            <h2 id="logout-modal-title">Log out?</h2>
            <p>Are you sure you want to log out of HallBook?</p>
            <div className="logout-modal-actions">
              <button
                className="logout-cancel"
                type="button"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </button>
              <button
                className="logout-confirm"
                type="button"
                onClick={confirmLogout}
              >
                Logout
              </button>
            </div>
          </section>
        </div>,
        document.body
      )}
    </>
  )
}

export default LogoutButton
