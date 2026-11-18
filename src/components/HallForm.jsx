import { useState } from 'react'

function HallForm({ onSave, submitting = false, submitLabel = 'Submit hall for review' }) {
  const [facilities, setFacilities] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget

    const saved = await onSave({
      name: form.elements.name.value,
      location: form.elements.location.value,
      capacity: form.elements.capacity.value,
      price: form.elements.price.value,
      image: form.elements.image.value,
      facilities,
      description: form.elements.description.value
    })

    if (saved) {
      form.reset()
      setFacilities('')
    }
  }

  return (
    <form className="management-form" onSubmit={handleSubmit}>
      <label>
        Hall name
        <input name="name" required maxLength="100" />
      </label>
      <label>
        Location
        <input name="location" required maxLength="160" />
      </label>
      <div className="management-form-row">
        <label>
          Capacity
          <input name="capacity" type="number" min="1" step="1" required />
        </label>
        <label>
          Price per day (₹)
          <input name="price" type="number" min="0" step="0.01" required />
        </label>
      </div>
      <label>
        Image URL
        <input name="image" type="url" required placeholder="https://example.com/hall.jpg" />
      </label>
      <label>
        Facilities (comma-separated)
        <input
          value={facilities}
          onChange={(event) => setFacilities(event.target.value)}
          placeholder="Parking, catering, air conditioning"
        />
      </label>
      <label>
        Description
        <textarea name="description" rows="3" maxLength="1000" />
      </label>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}

export default HallForm
