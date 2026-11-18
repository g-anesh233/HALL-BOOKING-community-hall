const User = require('../models/User')

const ownerMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId)

        if (!user || user.role !== 'owner' || user.ownerApplicationStatus !== 'approved') {
            return res.status(403).json({
                message: 'Access denied. Approved venue owner access is required.'
            })
        }

        next()
    } catch (error) {
        console.error('Owner access verification failed:', error.name)
        res.status(500).json({
            message: 'Failed to verify venue owner access'
        })
    }
}

module.exports = ownerMiddleware
