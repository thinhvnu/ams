
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./../../models/User');
const ChatGroup = require('./../../models/ChatGroup');
const Message = require('./../../models/Message');
const Apartment = require('./../../models/Apartment');
const ApartmentBuilding = require('./../../models/ApartmentBuilding');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

/**
 * GET /api/chat/clients
 */
exports.getClients = (req, res, next) => {
    try {
        let user = req.session.user,
            cacheKey = 'chat_clients_' + user.id;

        client.get(cacheKey, (err, users) => {
            if (err) {
                console.log('err', err);
                throw err;
            }
            
            if (users && process.env.CACHE_ENABLE === 1) {
                return res.json({
                    success: true,
                    errorCode: 0,
                    data: JSON.parse(users),
                    message: 'Get list clients successfully'
                });
            } else {
                User.findById(user._id).populate({
                    path: 'groups',
                    model: 'ChatGroup'
                }).exec((err, u) => {
                    Message.aggregate([
                        // your where clause: note="test2" and notetwo = "meet2"
                        {
                            $match: { 
                                $or: [
                                    {'sender': mongoose.Types.ObjectId(user._id)},
                                    {'recipient': mongoose.Types.ObjectId(user._id)}
                                ]
                            }
                        },
                        {
                            $sort: {createdAt: -1}
                        },
                        // group by key, score to get distinct
                        {"$group" : {_id : {sender:"$sender", recipient:"$recipient"}}}, 
                    ]).exec((err, data) => {
                        if (data && data.length > 0) {
                            let ids = [];
                            for (let i=0; i<data.length; i++) {
                                ids.push(data[i]._id.sender);
                                ids.push(data[i]._id.recipient);
                            }
                            User.find({
                                _id: { 
                                    $ne: user._id,
                                    $in: ids
                                }
                            }).exec((err, users) => {
                                let listUsers = users, count = 0;
                                if (users.length > 0) {
                                    for (let i=0; i<users.length; i++) {
                                        Message.count({
                                            sender: users[i]._id,
                                            recipient: user._id,
                                            isRead: false
                                        }).exec((err, c) => {
                                            listUsers[i] = {...{messUnread: c}, ...users[i].toObject(), ...{avatarUrl: users[i].avatarUrl}};
                                            count ++;
                                            if (count >= users.length) {
                                                if (u && u.groups && u.groups.length) {
                                                    let groups = [], jCount = 0;
                                                    for (let j=0; j<u.groups.length; j++) {
                                                        Message.count({
                                                            sender: {
                                                                $ne: user._id
                                                            },
                                                            recipient: u.groups[j]._id,
                                                            isRead: false
                                                        }).exec((err, c) => {
                                                            groups[j] = {...{messUnread: c}, ...u.groups[j].toObject()}
                                                            jCount ++;
                                                            if (jCount >= u.groups.length) {
                                                                return res.json({
                                                                    success: true,
                                                                    errorCode: 0,
                                                                    data: {
                                                                        users: listUsers,
                                                                        groups: groups
                                                                    },
                                                                    message: 'Get list clients successfully'
                                                                })
                                                            }
                                                        });
                                                    }
                                                } else {
                                                    return res.json({
                                                        success: true,
                                                        errorCode: 0,
                                                        data: {
                                                            users: listUsers,
                                                            groups: u.groups
                                                        },
                                                        message: 'Get list clients successfully'
                                                    })
                                                }
                                            }
                                        })
                                    }
                                } else {
                                    return res.json({
                                        success: true,
                                        errorCode: 0,
                                        data: {
                                            users: [],
                                            groups: u.groups
                                        },
                                        message: 'Get list clients successfully'
                                    })
                                }
                            });
                        } else {
                            return res.json({
                                success: true,
                                errorCode: 0,
                                data: []
                            })
                        }
                    })
                })
            }
        });
    } catch (e) {
        return res.json({
            success: false,
            errorCode: '111',
            data: [],
            message: 'Server Exception'
        })
    }
};

exports.getMessages = (req, res, next) => {
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
        
        if (req.query.isGroup === true || req.query.isGroup === 'true') {
            Message.find({
                'recipient': req.params.roomId
            }, {
                'sender': 1,
                'messageContent': 1,
                'createdAt': 1,
                'updatedAt': 1
            })
            .sort('-createdAt')
            .skip(page * pageSize)
            .limit(pageSize)
            .populate('sender', {
                '_id': 1,
                'avatar': 1,
                'userName': 1,
            })
            .exec(function (err, messages) {
                if (err) {
                    console.log('err', err);
                    return res.json({
                        success: false,
                        errorCode: '0004',
                        data: err,
                        message: 'Error'
                    });
                } else {
                    return res.json({
                        success: true,
                        errorCode: 0,
                        data: messages.reverse(),
                        message: 'Get message successfully'
                    });
                }
            });
        } else {
            Message.find({
                $or:[ 
                    {'sender': req.session.user._id, 'recipient': req.params.roomId},
                    {'sender': req.params.roomId, 'recipient': req.session.user._id}
                ]
            }, {
                'sender': 1,
                'messageContent': 1,
                'createdAt': 1,
                'updatedAt': 1
            })
            .sort('-createdAt')
            .skip(page * pageSize)
            .limit(pageSize)
            .populate('sender', {
                '_id': 1,
                'avatar': 1,
                'userName': 1,
            })
            .exec(function (err, messages) {
                if (err) {
                    console.log('err', err);
                    return res.json({
                        success: false,
                        errorCode: '0004',
                        data: err,
                        message: 'Error'
                    });
                } else {
                    return res.json({
                        success: true,
                        errorCode: 0,
                        data: messages.reverse(),
                        message: 'Get message successfully'
                    });
                }
            });
        }
    } catch (e) {
        return res.json({
            success: false,
            errorCode: '111',
            data: [],
            message: 'Exception'
        })
    }
}

exports.getUpdateReadMessage = (req, res, next) => {
    try {
        if (req.query.isGroup) {
            Message.updateMany({'recipient': req.params.roomId, 'sender': {
                $ne: req.session.user._id
            }}, {isRead: true}, (err, result) => {
                if (err) {
                    return res.json({
                        success: false,
                        errorCode: '112',
                        message: 'An error happend'
                    })
                } else {
                    return res.json({
                        success: true,
                        errorCode: 0,
                        message: 'Updated successfully'
                    })
                }
            })
        } else {
            Message.updateMany({'sender': req.params.roomId, 'recipient': req.session.user._id}, {isRead: true}, (err, result) => {
                if (err) {
                    return res.json({
                        success: false,
                        errorCode: '112',
                        message: 'An error happend'
                    })
                } else {
                    return res.json({
                        success: true,
                        errorCode: 0,
                        message: 'Updated successfully'
                    })
                }
            })
        }
    } catch (e) {
        return res.json({
            success: false,
            errorCode: '111',
            message: 'Server exception'
        })
    }
}

/**
 * Create group chat
 */
exports.postCreateGroup = (req, res, next) => {
    req.checkBody('abgId', 'Vui lòng chọn khu chung cư').notEmpty();
    req.checkBody('buildingId', 'Vui lòng chọn tòa nhà').notEmpty();
    req.checkBody('groupName', 'Vui lòng đặt tên nhóm').notEmpty();

    var errors = req.getValidationResult().then(function(errors) {
		if (!errors.isEmpty()) {
			var errors = errors.mapped();
			return res.json({
                success: false,
                errorCode: '221',
                errors: errors,
                message: 'Tên nhóm chat không được để trống'
            })
        }
        User.findById(req.body.buildingId).exec((err, userAdmin) => {
            let newGroup = new ChatGroup();
            newGroup.groupName = req.body.groupName;
            newGroup.building = req.body.buildingId;
            newGroup.buildingGroup = req.body.abgId;
            newGroup.status = 1;
            newGroup.createdBy = req.session.user._id;
            newGroup.members.push(req.session.user._id);
            if (userAdmin) {
                newGroup.members.push(userAdmin._id);
            }
            newGroup.save((err, ng) => {
                if (err) {
                    console.log('err', err);
                    return res.json({
                        success: false,
                        errorCode: '222',
                        message: 'Có lỗi trong quá trình xử lý'
                    });
                }
                // ApartmentBuilding.findById(buildingId).exec((err, building) => {

                // });
                User.findById(req.session.user._id).exec((err, user) => {
                    if (user) {
                        /* Join user create group */
                        if (!user.groups) {
                            user.groups = [];
                        }
                        user.groups.pull(ng._id);
                        user.groups.push(ng._id);
                        user.save((err, u) => {
                            if (userAdmin) {
                                userAdmin.groups.pull(ng._id);
                                userAdmin.groups.push(ng._id);
                                userAdmin.save((err, result) => {
                                    return res.json({
                                        success: true,
                                        errorCode: 0,
                                        group: newGroup,
                                        message: 'Tạo nhóm thành công'
                                    })
                                })
                            } else {
                                return res.json({
                                    success: true,
                                    errorCode: 0,
                                    group: newGroup,
                                    message: 'Tạo nhóm thành công'
                                })
                            }
                        })
                    }
                })
            });
        });
    })
}

exports.postAddMemberToGroup = (req, res, next) => {
    try {
        let groupId = req.params.groupId;
        req.checkBody('memberIds', 'Member ID không được để trống').notEmpty();

        var errors = req.getValidationResult().then(function(errors) {
            if (!errors.isEmpty()) {
                var errors = errors.mapped();
                return res.json({
                    success: false,
                    errorCode: '221',
                    message: 'Member ID không được để trống'
                });
            }
            let memberIds = req.body.memberIds;
            ChatGroup.findById(groupId)
                .exec((err, group) => {
                    if (err) {
                        return res.json({
                            success: false,
                            errorCode: '222',
                            message: 'Có lỗi trong quá trình xử lý'
                        });
                    }
                    if (!group) {
                        return res.json({
                            success: false,
                            errorCode: '223',
                            message: 'Không tìm thấy nhóm'
                        });
                    }
                    for (let i=0; i<memberIds.length; i++) {
                        if (memberIds[i].match(/^[0-9a-fA-F]{24}$/)) {
                            // Yes, it's a valid ObjectId, proceed with `findById` call.
                            group.members.pull(memberIds[i]);
                            group.members.push(memberIds[i]);
                        } else {
                            memberIds.splice(i, 1);
                        }
                    }
                    group.save((err, g) => {
                        User.find({
                            _id: {$in: memberIds}
                        }).exec((err, members) => {
                            if (members) {
                                for (let j=0; j<members.length; j++) {
                                    members[j].groups.pull(group._id);
                                    members[j].groups.push(group._id);
                                    members[j].save();
                                }
                            }
                            return res.json({
                                success: true,
                                errorCode: 0,
                                message: 'Thêm thành viên vào nhóm thành công'
                            })
                        })
                    })
                });
        });
    } catch (e) {
        console.log('e', e);
    }
}

exports.getGroup = (req, res, next) => {
    User.findById(req.session.user._id)
    .populate({
        path: 'groups',
        model: 'ChatGroup'
    })
    .exec((err, user) => {
        if (err) {
            console.log('err', err);
            return res.json({
                success: false,
                errorCode: '112',
                message: 'Error happen'
            })
        }
        return res.json({
            success: true,
            errorCode: 0,
            data: user.groups,
            message: 'Get user groups successfully'
        });
    });
}

exports.getAdmin = (req, res, next) => {
    // let user = req.session.user._id;

    try {
        // if (user.apartments && user.apartments[0]) {
            /* Return admin of building */
            User.findById(req.session.user._id).exec((err, user) => {
                // console.log('user', user);
                if (user.apartments) {
                    Apartment.find({_id: {$in: user.apartments}}).exec((err, apartments) => {
                        console.log('apartments', apartments);
                        if (apartments && apartments.length > 0) {

                            let apartment = apartments[0];
                            ApartmentBuilding.findById(apartment.building)
                            .populate({
                                path: 'manager',
                                model: 'User',
                                select: {_id: 1, firstName: 1, lastName: 1, phoneNumber: 1, avatar: 1, avatarUrl: 1}
                            }).exec((err, building) => {
                                if (building) {
                                    return res.json({
                                        success: true,
                                        errorCode: 0,
                                        data: building.manager
                                    })
                                } else {
                                    return res.json({
                                        success: true,
                                        errorCode: 0,
                                        data: {}
                                    })
                                }
                            })
                        } else {
                            return res.json({
                                success: true,
                                errorCode: 0,
                                data: {}
                            })
                        }
                    });
                } else {
                    return res.json({
                        success: true,
                        errorCode: 0,
                        data: {}
                    })
                }
            })
        // }
    } catch (e) {
        return res.json({
            success: true,
            errorCode: 0,
            data: {}
        })
    }
}