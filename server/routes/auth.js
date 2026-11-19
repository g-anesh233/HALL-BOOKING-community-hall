const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const User = require('../models/User')
const authMiddleware = require('../middleware/authMiddleware')
const { sendVerificationEmail } = require('../utils/email')

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
        const existingUser = await User.findOne({
            email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: 'i' }
        })

        if (existingUser?.emailVerified) {
            return res.status(400).json({
                message: 'Email already registered'
            })
        }

        const verificationToken = crypto.randomBytes(32).toString('hex')
        const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex')
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

        let newUser = existingUser
        if (!newUser) {
            const hashedPassword = await bcrypt.hash(password, 10)
            newUser = new User({
                name: name.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                emailVerified: false
            })
        }

        newUser.emailVerificationToken = verificationTokenHash
        newUser.emailVerificationExpires = verificationExpires
        await newUser.save()

        try {
            await sendVerificationEmail(normalizedEmail, verificationToken)
        } catch (error) {
            console.error('Verification email delivery failed:', error.name)
            return res.status(503).json({
                message: 'Could not send the verification email. Submit the form again to retry.'
            })
        }

        res.status(existingUser ? 200 : 201).json({
            message: `A verification link has been sent to ${normalizedEmail}. Verify your email within 24 hours to activate your account.`
        })

    } catch (error) {
        console.error('Registration failed:', error.name)
        res.status(500).json({
            message: 'Server error'
        })
    }
})

router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body

        if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) {
            return res.status(400).json({ message: 'This verification link is invalid or has expired.' })
        }

        const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
        const user = await User.findOne({
            emailVerificationToken: tokenHash,
            emailVerificationExpires: { $gt: new Date() }
        })

        if (!user) {
            return res.status(400).json({ message: 'This verification link is invalid or has expired.' })
        }

        user.emailVerified = true
        user.emailVerificationToken = undefined
        user.emailVerificationExpires = undefined
        await user.save()

        res.status(200).json({ message: 'Your email has been verified. You can now sign in.' })
    } catch (error) {
        console.error('Email verification failed:', error.name)
        res.status(500).json({ message: 'Failed to verify your email. Please try again.' })
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

        if (!user.emailVerified) {
            return res.status(403).json({
                message: 'Please verify your email using the link we sent before signing in.'
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