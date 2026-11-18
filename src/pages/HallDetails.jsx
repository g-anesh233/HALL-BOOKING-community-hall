import '../App.css'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import LogoutButton from '../components/LogoutButton'
import { useAuth } from '../hooks/useAuth'
function HallDetails() {
  const location = useLocation()
  const navigate = useNavigate()
  const { clearSession } = useAuth()
const [profileOpen, setProfileOpen] = useState(false)

const handleLogout = () => {
  clearSession()
  navigate('/login', { replace: true })
}

  const hall = location.state?.hall || {
    name: 'Royal Celebration Hall',
    location: 'Mangalore, Karnataka',
    capacity: '500 People',
    price: '₹25,000',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3'
  }

  return (
    <>
     <nav className="dashboard-navbar">
  <div className="logo">
    Hall<span>Book</span>
  </div>

  <ul className="nav-links">
    <li><Link to="/dashboard">Home</Link></li>
    <li><Link to="/explore-halls">Explore Halls</Link></li>
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
        <hr />
        <LogoutButton onLogout={handleLogout} />
      </div>
    )}
  </div>
</nav>

      <div className="explore-page">
        <h1>{hall.name}</h1>

        <div className="hall-card">
          <img src={hall.image} alt={hall.name} />

          <div className="hall-info">
            <h3>{hall.name}</h3>
            <p>📍 {hall.location}</p>
            <p>👥 Capacity: {hall.capacity}</p>
            <p>Facilities: Parking, Dining Area, AC</p>
            <h4>{hall.price} / Day</h4>

<Link to="/booking" state={{ hall }}>              <button>Book Now</button>
            </Link>
          </div>
        </div>

        <br />

        <Link to="/explore-halls">← Back to Explore Halls</Link>
      </div>
    </>
  )
}

export default HallDetails