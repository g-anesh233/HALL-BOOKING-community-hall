const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'owner', 'admin'],
        default: 'user',
        index: true
    },
    ownerApplicationStatus: {
        type: String,
        enum: ['none', 'pending', 'approved', 'rejected'],
        default: 'none',
        index: true
    },
    ownerApplicationBusinessName: {
        type: String,
        default: ''
    },
    ownerApplicationPhone: {
        type: String,
        default: ''
    },
    ownerApplicationMessage: {
        type: String,
        default: ''
    }
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

module.exports = User