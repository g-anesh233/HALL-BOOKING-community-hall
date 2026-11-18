const express = require('express')
const Hall = require('../models/Hall')
const authMiddleware = require('../middleware/authMiddleware')
const ownerMiddleware = require('../middleware/ownerMiddleware')
const prepareHallInput = require('../utils/hallInput')

const router = express.Router()

// Get all halls
router.get('/', async (req, res) => {
    try {
        const halls = await Hall.find({
            $or: [
                { status: 'Approved' },
                { status: { $exists: false } }
            ]
        })

        res.status(200).json(halls)

    } catch (error) {
        console.error('Failed to fetch public halls:', error.name)
        res.status(500).json({
            message: 'Failed to fetch halls'
        })
    }
})

router.get('/mine', authMiddleware, ownerMiddleware, async (req, res) => {
    try {
        const halls = await Hall.find({ ownerId: req.user.userId }).sort({ createdAt: -1 })
        res.status(200).json(halls)
    } catch (error) {
        console.error('Failed to fetch owner halls:', error.name)
        res.status(500).json({ message: 'Failed to fetch your halls' })
    }
})

router.post('/', authMiddleware, ownerMiddleware, async (req, res) => {
    try {
        const hallInput = prepareHallInput(req.body)

        if (!hallInput) {
            return res.status(400).json({
                message: 'Enter a name, location, image, positive capacity, and valid price'
            })
        }

        const hall = await Hall.create({
            ...hallInput,
            ownerId: req.user.userId,
            status: 'Pending'
        })

        res.status(201).json({
            message: 'Hall submitted for admin review',
            hall
        })
    } catch (error) {
        console.error('Hall submission failed:', error.name)
        res.status(500).json({ message: 'Failed to submit hall' })
    }
})

// Get hall by ID
router.get('/:id', async (req, res) => {
    try {
        const hall = await Hall.findById(req.params.id)

        if (!hall || (hall.status && hall.status !== 'Approved')) {
            return res.status(404).json({
                message: 'Hall not found'
            })
        }

        res.status(200).json(hall)

    } catch (error) {
        console.error('Failed to fetch hall details:', error.name)
        res.status(500).json({
            message: 'Failed to fetch hall'
        })
    }
})

module.exports = router