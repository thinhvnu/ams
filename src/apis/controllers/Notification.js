const Notification = require('../../models/Notification');
const NotificationLog = require('../../models/NotificationLog');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

// Get all active sliders
exports.getList = (req, res, next) => {
    try {
        let page = 0, pageSize = 50;

        if (req.query) {
            if (req.query.page) {
                page = req.query.page - 1;
            }
            if (req.query.pageSize) {
                pageSize = parseInt(req.query.pageSize);
            }
        }

        NotificationLog.find({
            isFirst: true,
            sendTo: req.session.user._id
        })
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

                let data = [];

                for (let i = 0; i < notifications.length; i++) {
                    data.push(
                        {
                            id:notifications[i].id,
                            status:notifications[i].status,
                            title: notifications[i].notification ? notifications[i].notification.title : 'Có cháy, cư dân di tản',
                            description: notifications[i].notification ? notifications[i].notification.description : 'Có cháy, cư dân di tản',
                            content: notifications[i].notification ? notifications[i].notification.content : 'Có cháy, cư dân di tản',
                            createdAt: notifications[i].createdAt
                        }
                    )
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

exports.getListByRole = (req, res, next) => {
    try {
        Notification.find({
            type: {
                $in: [2, 3, 4, 5]
            },
            recipient: req.session.user._id
        }).populate({
            path: 'sender',
            model: 'User'
        }).populate({
            path: 'objId',
            model: 'ServiceRequest',
            populate: {
                path: 'service',
                model: 'Service'
            }
        }).sort('-createdAt').exec((err, notifications) => {
            return res.json({
                success: true,
                errorCode: 0,
                data: notifications,
                message: 'Get list notification successfully'
            })
        });
    } catch (e) {
        return res.json({
            success: false,
            errorCode: '111',
            data: [],
            message: 'Server exception'
        })
    }
}

exports.updateSeenStatus = (req, res, next) => {
   try {
        let noti_id = req.params.noti_id;
        
        console.log("noti_id",noti_id);
        NotificationLog.findById(noti_id, (err, result)=> {
            
            if (err) { 
                return res.json({
                    success: false,
                    errorCode: '002',
                    data: JSON.stringify(err),
                    message: 'Error'
                })
            }
            
            if (result) {
                result.status = 2;
                result.save(function (err, updateNoti) {
                    
                    if (err) {

                        return res.json({
                            success: false,
                            errorCode: '002',
                            data: JSON.stringify(err),
                            message: 'Error'
                        })
                    }
                    return res.json({
                        success: true,
                        errorCode: 0,
                        message: 'Cập nhật xem thông báo thành công'
                    });
                });

            } else {
                
           
                return res.json({
                    success: false,
                    errorCode: '002',
                    message: 'Không tìm thấy id thông báo'
                })
            }


        });

    } catch (e) {
        return res.json({
            success: false,
            errorCode: '111',
            data: [],
            message: 'Server exception'
        })
    }
}

exports.getView = (req, res, next) => {
    try {
        Notification.findById(req.params.notiId).exec((err, notification) => {
            return res.json({
                success: true,
                errorCode: 0,
                data: notification
            })
        })
    } catch (e) {
        return res.json({
            success: false,
            errorCode: '111',
            message: 'Server exception'
        })
    }
}