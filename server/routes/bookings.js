const express = require('express')
const Booking = require('../models/Booking')
const Hall = require('../models/Hall')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

// Create a new booking
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            hallId,
            customerName,
            email,
            phone,
            eventType,
            eventDate,
            guests,
            duration,
            requirements
        } = req.body

        if (
            !hallId || !customerName || !email || !phone ||
            !eventType || !eventDate || !guests || !duration
        ) {
            return res.status(400).json({
                message: 'Please fill all required fields'
            })
        }

        const hall = await Hall.findById(hallId)

        if (!hall) {
            return res.status(404).json({
                message: 'Hall not found'
            })
        }

        if (hall.status && hall.status !== 'Approved') {
            return res.status(400).json({
                message: 'This hall is not currently accepting booking requests'
            })
        }

        const totalPrice = hall.price * Number(duration)

        const booking = new Booking({
            user: req.user.userId,
            hall: hall._id,
            hallName: hall.name,
            location: hall.location,
            customerName,
            email,
            phone,
            eventType,
            eventDate,
            guests: Number(guests),
            duration: Number(duration),
            totalPrice,
            requirements
        })

        await booking.save()

        res.status(201).json({
            message: 'Booking request submitted successfully!',
            booking
        })

    } catch (error) {
        console.error('Booking Error:', error.message)

        res.status(500).json({
            message: 'Failed to create booking'
        })
    }
})

// Get bookings of the logged-in user
router.get('/my-bookings', authMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.find({
            user: req.user.userId
        }).sort({ createdAt: -1 })

        res.status(200).json(bookings)

    } catch (error) {
        console.error('Failed to fetch customer bookings:', error.name)
        res.status(500).json({
            message: 'Failed to fetch bookings'
        })
    }
})

module.exports = router