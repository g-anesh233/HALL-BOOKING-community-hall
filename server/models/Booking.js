const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hall: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hall',
        required: true
    },
    hallName: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    eventType: {
        type: String,
        required: true
    },
    eventDate: {
        type: Date,
        required: true
    },
    guests: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    requirements: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    }
}, { timestamps: true })

bookingSchema.index({ user: 1, createdAt: -1 })
bookingSchema.index({ hall: 1, createdAt: -1 })

const Booking = mongoose.model('Booking', bookingSchema)

module.exports = Booking