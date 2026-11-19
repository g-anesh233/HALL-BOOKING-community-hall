const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const authMiddleware = require('../middleware/authMiddleware')
const { getLikelyMisspelledDomain } = require('../utils/emailDomain')

const router = express.Router()
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const serializeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    ownerApplicationStatus: user.ownerApplicationStatus
})

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)

        if (!user) {
            return res.status(401).json({ message: 'Account not found. Please sign in again.' })
        }

        res.status(200).json({ user: serializeUser(user) })
    } catch (error) {
        console.error('Account lookup failed:', error.name)
        res.status(500).json({ message: 'Failed to load account details' })
    }
})

router.post('/owner-application', authMiddleware, async (req, res) => {
    try {
        const { businessName, phone, message = '' } = req.body
        const user = await User.findById(req.user.userId)

        if (!user) {
            return res.status(404).json({ message: 'Account not found' })
        }

        if (user.role === 'admin' || user.role === 'owner') {
            return res.status(400).json({ message: 'This account already has venue management access' })
        }

        if (user.ownerApplicationStatus === 'pending' || user.ownerApplicationStatus === 'approved') {
            return res.status(409).json({ message: 'An owner application has already been submitted for this account' })
        }

        if (
            typeof businessName !== 'string' || !businessName.trim() ||
            typeof phone !== 'string' || !phone.trim() ||
            typeof message !== 'string' || message.length > 1000
        ) {
            return res.status(400).json({ message: 'Enter your business name, phone number, and a message under 1000 characters' })
        }

        user.ownerApplicationBusinessName = businessName.trim()
        user.ownerApplicationPhone = phone.trim()
        user.ownerApplicationMessage = message.trim()
        user.ownerApplicationStatus = 'pending'
        await user.save()

        res.status(201).json({
            message: 'Owner application submitted for review',
            user: serializeUser(user)
        })
    } catch (error) {
        console.error('Owner application submission failed:', error.name)
        res.status(500).json({ message: 'Failed to submit owner application' })
    }
})

// User Registration API
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (
            typeof name !== 'string' || !name.trim() ||
            typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
            typeof password !== 'string' || !password
        ) {
            return res.status(400).json({
                message: 'Enter your name, a valid email address, and a password'
            })
        }

        const normalizedEmail = email.trim().toLowerCase()
        const emailDomain = normalizedEmail.split('@')[1]
        const suggestedDomain = getLikelyMisspelledDomain(emailDomain)

        if (suggestedDomain) {
            return res.status(400).json({
                message: `Check the spelling of your email domain. Did you mean @${suggestedDomain}?`
            })
        }

        const existingUser = await User.findOne({
            email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: 'i' }
        })

        if (existingUser) {
            return res.status(400).json({
                message: 'Email already registered'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        })
        await newUser.save()

        const token = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        )

        res.status(201).json({
            message: 'Registration successful!',
            token,
            user: serializeUser(newUser)
        })

    } catch (error) {
        console.error('Registration failed:', error.name)
        res.status(500).json({
            message: 'Server error'
        })
    }
})

// User Login API
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ message: 'Invalid email or password' })
        }

        const user = await User.findOne({
            email: { $regex: `^${escapeRegex(email.trim())}$`, $options: 'i' }
        })

        if (!user) {
            return res.status(400).json({
                message: 'Invalid email or password'
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid email or password'
            })
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        )

        res.status(200).json({
            message: 'Login successful!',
            token,
            user: serializeUser(user)
        })

    } catch (error) {
        console.error('Login failed:', error.name)
        res.status(500).json({
            message: 'Server error'
        })
    }
})
module.exports = router