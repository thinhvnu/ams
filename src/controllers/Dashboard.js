const User = require('./../models/User');
const Notification = require('./../models/Notification');
const NotificationLog = require('./../models/NotificationLog');
const ApartmentBuildingGroup = require('./../models/ApartmentBuildingGroup');

exports.getIndex = (req, res, next) => {
    try {
        /**
         * Get last 10 notification
         */
        NotificationLog.find({
            isFirst: true
        })
        .populate({
            path: 'notification',
            model: 'Notification'
        })
        .populate({
            path: 'sendTo',
            model: 'User',
            select: {_id: 1, userName: 1, firstName: 1, lastName: 1, phoneNumber: 1}
        })
        .sort('-createdAt')
        .limit(10)
        .exec((err, nLogs) => {
            User.find({
                _id: {
                    $ne: req.session.user._id
                },
                status: 1
            })
                .sort('-createdAt')
                .limit(100)
                .exec((err, users) => {
                    User.findById(req.session.user._id)
                    .populate({
                        path: 'groups',
                        model: 'ChatGroup'
                    }).exec((err, user) => {
                        ApartmentBuildingGroup.find({
                            status: 1
                        }).sort('-createdAt').exec((err, abgs) => {
                            try {
                                res.render('dashboard/index', {
                                    title: 'Phần mềm quản lý chung cư',
                                    current: ['dashboard', 'index'],
                                    notifications: nLogs,
                                    users: users,
                                    user: user,
                                    abgs: abgs
                                });
                            } catch (e) {
                                next(e);
                            }
                            
                        });  
                    })
                })
        })
    } catch (e) {
        res.render('dashboard/index', {
            title: 'Phần mềm quản lý chung cư',
            current: ['dashboard', 'index']
        });
    }
};

exports.getTest = (req, res, next) => {
    User.findOne().exec((err, user) => {
        let a = [];
        a.pull(1);
    })
}