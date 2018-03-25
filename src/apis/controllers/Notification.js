const NotificationLog = require('../../models/NotificationLog');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

// Get all active sliders
exports.getList = (req, res, next) => {
    try {
        NotificationLog.find({sendTo: req.session.user._id})
            .exec((err, notifications) => {
                if (err) {
                    return res.json({
                        success: false,
                        errorCode: '002',
                        message: 'Error'
                    })
                }
                return res.json({
                    success: true,
                    errorCode: 0,
                    data: notifications,
                    message: 'Get list notification successfully'
                })
            })
    } catch (e) {
        return res.json({
            success: false,
            errorCode: '111',
            data: [],
            message: 'Server exception'
        })
    }
};