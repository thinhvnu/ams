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
        // .populate({
        //     path: 'apartment',
        //     model: 'Apartment'
        // })
        // .populate({
        //     path: 'building',
        //     model: 'ApartmentBuilding'
        // })
        // .populate({
        //     path: 'buildingGroup',
        //     model: 'ApartmentBuildingGroup'
        // })
        .exec((err, nLogs) => {
            User.find({
                _id: {
                    $ne: req.session.user._id
                },
                status: 1
            })
                .sort('-createdAt')
                .limit(10)
                .exec((err, users) => {
                    User.findById(req.session.user._id)
                    .populate({
                        path: 'groups',
                        model: 'ChatGroup'
                    }).exec((err, user) => {
                        ApartmentBuildingGroup.find({
                            status: 1
                        }).sort('-createdAt').exec((err, abgs) => {
                            res.render('dashboard/index', {
                                title: 'Phần mềm quản lý chung cư',
                                current: ['dashboard', 'index'],
                                notifications: nLogs,
                                users: users,
                                user: user,
                                abgs: abgs
                            });
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