const express = require('express')
const Booking = require('../models/Booking')
const Hall = require('../models/Hall')
const authMiddleware = require('../middleware/authMiddleware')
const ownerMiddleware = require('../middleware/ownerMiddleware')

const router = express.Router()

router.get('/bookings', authMiddleware, ownerMiddleware, async (req, res) => {
    try {
        const halls = await Hall.find({ ownerId: req.user.userId }).select('_id')
        const bookings = await Booking.find({
            hall: { $in: halls.map((hall) => hall._id) }
        }).sort({ createdAt: -1 })

        res.status(200).json(bookings)
    } catch (error) {
        console.error('Failed to fetch owner bookings:', error.name)
        res.status(500).json({ message: 'Failed to fetch your hall bookings' })
    }
})

router.patch('/bookings/:id/status', authMiddleware, ownerMiddleware, async (req, res) => {
    try {
        const { status } = req.body

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid booking status' })
        }

        const booking = await Booking.findById(req.params.id).populate('hall', 'ownerId')

        if (!booking || !booking.hall || String(booking.hall.ownerId) !== req.user.userId) {
            return res.status(404).json({ message: 'Booking not found for your halls' })
        }

        if (booking.status !== 'Pending') {
            return res.status(409).json({ message: 'Only pending bookings can be updated' })
        }

        booking.status = status
        await booking.save()

        res.status(200).json({
            message: `Booking ${status.toLowerCase()} successfully`,
            booking
        })
    } catch (error) {
        console.error('Owner booking update failed:', error.name)
        res.status(500).json({ message: 'Failed to update booking status' })
    }
})

module.exports = router
