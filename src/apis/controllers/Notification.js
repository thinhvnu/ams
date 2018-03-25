const NotificationLog = require('../../models/NotificationLog');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

// Get all active sliders
exports.getList = (req, res, next) => {
    try {
        let page = 0, pageSize = 10;

        if (req.query) {
            if (req.query.page) {
                page = req.query.page - 1;
            }
            if (req.query.pageSize) {
                pageSize = parseInt(req.query.pageSize);
            }
        }

        NotificationLog.find({})
            .sort('-createdAt')
            .skip(page * pageSize)
            .limit(pageSize)
            .populate({
                path: 'notification',
                model: 'Notification'
            })
            .exec((err, notifications) => {
                if (err) {
                    return res.json({
                        success: false,
                        errorCode: '002',
                        data: err,
                        message: 'Error'
                    })
                }

                let data = [], currentId = null;

                for (let i=0; i<notifications.length; i++) {
                    if (currentId !== notifications[i].id) {
                        data.push(
                            {
                                title: notifications[i].notification.title,
                                content: notifications[i].notification.content,
                                createdAt: notifications[i].createdAt
                            }
                        )
                        currentId = notifications[i].id;
                    }
                }

                return res.json({
                    success: true,
                    errorCode: 0,
                    data: data,
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