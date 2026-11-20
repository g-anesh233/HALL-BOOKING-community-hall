const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()
const Hall = require('./models/Hall')
const authRoutes = require('./routes/auth')
const hallRoutes = require('./routes/halls')
const bookingRoutes = require('./routes/bookings')
const adminRoutes = require('./routes/admin')
const ownerRoutes = require('./routes/owner')
// Middleware
app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/halls', hallRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/owner', ownerRoutes)

// Test API
app.get('/', (req, res) => {
    res.send('HallBook Backend is Running!')
})

// Connect MongoDB and start server
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)

        console.log('MongoDB Connected Successfully!')

        const hallsMissingCreator = await Hall.find({
            ownerId: { $ne: null },
            $or: [
                { createdBy: null },
                { createdBy: { $exists: false } }
            ]
        }).select('_id ownerId')

        for (const hall of hallsMissingCreator) {
            hall.createdBy = hall.ownerId
            await hall.save()
        }

        if (hallsMissingCreator.length) {
            console.log(`Linked ${hallsMissingCreator.length} existing hall(s) to their creator`)
        }

        const PORT = process.env.PORT || 5000

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })

    } catch (error) {
        console.error('MongoDB Connection Failed:', error.message)
    }
}

startServer()