import '../App.css'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import LogoutButton from '../components/LogoutButton'
import { useAuth } from '../hooks/useAuth'

const fallbackHalls = [
  {
    name: 'Royal Celebration Hall',
    location: 'Mangalore, Karnataka',
    capacity: 500,
    price: 25000,
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3'
  },
  {
    name: 'Grand Palace Hall',
    location: 'Udupi, Karnataka',
    capacity: 300,
    price: 18000,
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3'
  },
  {
    name: 'Green Garden Hall',
    location: 'Bangalore, Karnataka',
    capacity: 700,
    price: 35000,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865'
  },
  {
    name: 'Crystal Convention Centre',
    location: 'Mysore, Karnataka',
    capacity: 600,
    price: 30000,
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3'
  },
  {
    name: 'Silver Crown Hall',
    location: 'Mangalore, Karnataka',
    capacity: 400,
    price: 22000,
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3'
  },
  {
    name: 'Royal Orchid Convention',
    location: 'Bangalore, Karnataka',
    capacity: 800,
    price: 45000,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865'
  },
  {
    name: 'Ocean Pearl Hall',
    location: 'Udupi, Karnataka',
    capacity: 350,
    price: 20000,
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3'
  },
  {
    name: 'Celebration Grand Hall',
    location: 'Shivamogga, Karnataka',
    capacity: 500,
    price: 27000,
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3'
  },
  {
    name: 'Sunshine Function Hall',
    location: 'Hubli, Karnataka',
    capacity: 250,
    price: 15000,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865'
  },
  {
    name: 'Diamond Palace Convention',
    location: 'Mysore, Karnataka',
    capacity: 900,
    price: 50000,
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3'
  }
]

function ExploreHalls() {
  const { clearSession } = useAuth()
  const [searchLocation, setSearchLocation] = useState('')
  const [sortOption, setSortOption] = useState('recommended')
  const [profileOpen, setProfileOpen] = useState(false)
  const [halls, setHalls] = useState(() => fallbackHalls.map((hall) => ({
    ...hall,
    capacity: `${hall.capacity} People`,
    price: `₹${hall.price.toLocaleString('en-IN')}`
  })))
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/halls')

        if (!response.ok) {
          throw new Error(`Failed to fetch halls (${response.status})`)
        }

        const data = await response.json()

        setHalls(data.map((hall) => ({
          ...hall,
          capacity: `${hall.capacity} People`,
          price: `₹${Number(hall.price).toLocaleString('en-IN')}`
        })))
      } catch (error) {
        console.error('Error fetching halls:', error)
        setFetchError('Live listings are unavailable. Showing sample venues for now.')
      } finally {
        setLoading(false)
      }
    }

    fetchHalls()
  }, [])

  const navigate = useNavigate()
  const handleSearch = (e) => {
  e.preventDefault()

  document.getElementById('hall-results')?.scrollIntoView({
    behavior: 'smooth'
  })
}

  const filteredHalls = halls.filter((hall) =>
    hall.location?.toLowerCase().includes(searchLocation.toLowerCase())
  )
  const sortedHalls = [...filteredHalls].sort((a, b) => {
    const priceA = Number(String(a.price).replace(/[₹,]/g, ''))
    const priceB = Number(String(b.price).replace(/[₹,]/g, ''))
    const capacityA = parseInt(a.capacity, 10) || 0
    const capacityB = parseInt(b.capacity, 10) || 0

    if (sortOption === 'low-price') {
      return priceA - priceB
    }

    if (sortOption === 'high-price') {
      return priceB - priceA
    }

    if (sortOption === 'capacity') {
      return capacityB - capacityA
    }

    return 0
  })
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
          <li>
            <Link to="/dashboard">Home</Link>
          </li>

          <li>
            <Link to="/explore-halls">Explore Halls</Link>
          </li>
        </ul>

        {/* Profile Dropdown */}
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

      <main className="explore-page explore-halls-page">
        <header className="explore-heading">
          <span className="explore-eyebrow">FIND THE RIGHT SPACE</span>
          <h1>Explore community halls</h1>
          <p>Compare venues by location, capacity, and price to find the right fit.</p>
        </header>

        <form className="explore-search" onSubmit={handleSearch} role="search">
          <label className="visually-hidden" htmlFor="hall-location">
            Search halls by city
          </label>
          <div className="explore-search-field">
            <span aria-hidden="true">⌕</span>
            <input
              id="hall-location"
              type="search"
              placeholder="Enter a city, e.g. Mangalore"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
            />
            {searchLocation && (
              <button
                className="clear-search"
                type="button"
                onClick={() => setSearchLocation('')}
              >
                Clear
              </button>
            )}
          </div>
          <button type="submit">Search halls</button>
        </form>

        {fetchError && (
          <p className="listing-notice" role="status">{fetchError}</p>
        )}

        <section className="hall-results" id="hall-results" aria-label="Hall listings">
          <div className="hall-results-toolbar">
            <div>
              <span className="results-eyebrow">YOUR OPTIONS</span>
              <p>
                {loading
                  ? 'Loading the latest listings…'
                  : `${sortedHalls.length} ${sortedHalls.length === 1 ? 'hall' : 'halls'} found`}
              </p>
            </div>

            <div className="sort-control">
              <label htmlFor="sort-halls">Sort by</label>
              <select
                id="sort-halls"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="recommended">Recommended</option>
                <option value="low-price">Price: Low to High</option>
                <option value="high-price">Price: High to Low</option>
                <option value="capacity">Capacity: Highest First</option>
              </select>
            </div>
          </div>

          {sortedHalls.length > 0 ? (
            <div className="hall-container">
              {sortedHalls.map((hall, index) => (
                <article className="hall-card" key={hall._id || `${hall.name}-${index}`}>
                  <div className="hall-card-image">
                    <img src={hall.image} alt={hall.name} loading="lazy" />
                    <span className="hall-card-location">{hall.location}</span>
                  </div>

                  <div className="hall-info">
                    <h2>{hall.name}</h2>
                    <div className="hall-card-capacity">
                      <span aria-hidden="true">♧</span>
                      <span>Capacity</span>
                      <strong>{hall.capacity}</strong>
                    </div>

                    <div className="hall-card-footer">
                      <p className="hall-card-price">
                        <strong>{hall.price}</strong>
                        <span> / day</span>
                      </p>
                      <Link
                        to="/hall-details"
                        state={{ hall }}
                        className="hall-details-link"
                      >
                        View details <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="hall-empty-state">
              <span aria-hidden="true">⌕</span>
              <h2>No halls found in “{searchLocation}”</h2>
              <p>Try another city or clear your search to see all available halls.</p>
              <button type="button" onClick={() => setSearchLocation('')}>
                Clear search
              </button>
            </div>
          )}
        </section>
      </main>
    </>
  )
}

export default ExploreHalls