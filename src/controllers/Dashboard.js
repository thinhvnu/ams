const User = require('./../models/User');
const Notification = require('./../models/Notification');
const NotificationLog = require('./../models/NotificationLog');
const ApartmentBuildingGroup = require('./../models/ApartmentBuildingGroup');

exports.getIndex = (req, res, next) => {
    try {
        /**
         * Get last 10 notification
         */
        NotificationLog.find({})
        .populate({
            path: 'notification',
            model: 'Notification'
        })
        .populate({
            path: 'sendTo',
            model: 'User',
            select: {_id: 1, userName: 1, firstName: 1, lastName: 1, phoneNumber: 1}
        })
        .populate({
            path: 'apartment',
            model: 'Apartment'
        })
        .populate({
            path: 'building',
            model: 'ApartmentBuilding'
        })
        .populate({
            path: 'buildingGroup',
            model: 'ApartmentBuildingGroup'
        })
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
                    ApartmentBuildingGroup.find({
                        status: 1
                    }).sort('-createdAt').exec((err, abgs) => {
                        res.render('dashboard/index', {
                            title: 'Phần mềm quản lý chung cư',
                            current: ['dashboard', 'index'],
                            notifications: nLogs,
                            users: users,
                            groups: req.session.user.groups || [],
                            abgs: abgs
                        });
                    });
                })
        })
    } catch (e) {
        res.render('dashboard/index', {
            title: 'Phần mềm quản lý chung cư',
            current: ['dashboard', 'index']
        });
    }
};