const express = require('express')
const Booking = require('../models/Booking')
const Hall = require('../models/Hall')
const User = require('../models/User')
const authMiddleware = require('../middleware/authMiddleware')
const adminMiddleware = require('../middleware/adminMiddleware')
const prepareHallInput = require('../utils/hallInput')

const router = express.Router()

router.get('/owners', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const owners = await User.find({
            $or: [
                { role: 'owner', ownerApplicationStatus: 'approved' },
                { role: 'admin' }
            ]
        }).select('name email')
        res.status(200).json(owners)
    } catch (error) {
        console.error('Failed to fetch venue owners:', error.name)
        res.status(500).json({ message: 'Failed to fetch venue owners' })
    }
})

router.get('/owner-applications', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const applications = await User.find({
            ownerApplicationStatus: 'pending'
        }).select('name email ownerApplicationBusinessName ownerApplicationPhone ownerApplicationMessage createdAt')
            .sort({ createdAt: 1 })

        res.status(200).json(applications)
    } catch (error) {
        console.error('Failed to fetch owner applications:', error.name)
        res.status(500).json({ message: 'Failed to fetch owner applications' })
    }
})

router.patch('/owner-applications/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid owner application status' })
        }

        const user = await User.findOne({
            _id: req.params.id,
            ownerApplicationStatus: 'pending'
        })

        if (!user) {
            return res.status(404).json({ message: 'Pending owner application not found' })
        }

        user.ownerApplicationStatus = status
        if (status === 'approved') {
            user.role = 'owner'
        }
        await user.save()

        res.status(200).json({
            message: `Owner application ${status}`,
            application: {
                id: user._id,
                name: user.name,
                email: user.email,
                ownerApplicationStatus: user.ownerApplicationStatus
            }
        })
    } catch (error) {
        console.error('Owner application review failed:', error.name)
        res.status(500).json({ message: 'Failed to update owner application' })
    }
})

router.get('/halls', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const halls = await Hall.find()
            .populate('ownerId', 'name email')
            .sort({ createdAt: -1 })
        res.status(200).json(halls)
    } catch (error) {
        console.error('Failed to fetch admin halls:', error.name)
        res.status(500).json({ message: 'Failed to fetch halls' })
    }
})

router.post('/halls', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const hallInput = prepareHallInput(req.body)

        if (!hallInput) {
            return res.status(400).json({
                message: 'Enter a name, location, image, positive capacity, and valid price'
            })
        }

        const hall = await Hall.create({
            ...hallInput,
            status: 'Approved',
            ownerId: null
        })

        res.status(201).json({ message: 'Hall added successfully', hall })
    } catch (error) {
        console.error('Admin hall creation failed:', error.name)
        res.status(500).json({ message: 'Failed to add hall' })
    }
})

router.patch('/halls/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid hall status' })
        }

        const hall = await Hall.findOne({ _id: req.params.id, status: 'Pending' })

        if (!hall) {
            return res.status(404).json({ message: 'Pending hall submission not found' })
        }

        hall.status = status
        await hall.save()
        res.status(200).json({ message: `Hall ${status.toLowerCase()}`, hall })
    } catch (error) {
        console.error('Hall review failed:', error.name)
        res.status(500).json({ message: 'Failed to update hall status' })
    }
})

router.patch('/halls/:id/owner', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { ownerId } = req.body
        let owner = null

        if (ownerId) {
            owner = await User.findOne({
                _id: ownerId,
                $or: [
                    { role: 'owner', ownerApplicationStatus: 'approved' },
                    { role: 'admin' }
                ]
            })

            if (!owner) {
                return res.status(400).json({ message: 'Select an approved venue owner or platform admin' })
            }
        }

        const hall = await Hall.findByIdAndUpdate(
            req.params.id,
            { ownerId: owner ? owner._id : null },
            { new: true, runValidators: true }
        ).populate('ownerId', 'name email')

        if (!hall) {
            return res.status(404).json({ message: 'Hall not found' })
        }

        res.status(200).json({ message: 'Hall owner updated', hall })
    } catch (error) {
        console.error('Hall owner assignment failed:', error.name)
        res.status(500).json({ message: 'Failed to assign hall owner' })
    }
})

// Get all bookings
router.get('/bookings', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .sort({ createdAt: -1 })

        res.status(200).json(bookings)

    } catch (error) {
        console.error('Failed to fetch admin bookings:', error.name)
        res.status(500).json({
            message: 'Failed to fetch bookings'
        })
    }
})

// Approve or reject a booking
router.patch('/bookings/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({
                message: 'Invalid booking status'
            })
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        )

        if (!booking) {
            return res.status(404).json({
                message: 'Booking not found'
            })
        }

        res.status(200).json({
            message: `Booking ${status.toLowerCase()} successfully!`,
            booking
        })

    } catch (error) {
        console.error('Admin booking update failed:', error.name)
        res.status(500).json({
            message: 'Failed to update booking status'
        })
    }
})

module.exports = router