const jwt = require('jsonwebtoken');
const User = require('./../../models/User');
const ChatGroup = require('./../../models/ChatGroup');
const Message = require('./../../models/Message');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

/**
 * GET /api/chat/clients
 */
exports.getClients = (req, res, next) => {
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
            User.find({
                _id: { $ne: user._id },
                status: 1
            }, (err, users) => {
                if (err) {
                    return res.json({
                        success: false,
                        errorCode: '0004',
                        data: [],
                        message: 'Error'
                    });
                }

                res.json({
                    success: true,
                    errorCode: 0,
                    data: users,
                    message: 'Get list clients successfully'
                });

                /**
                 * Set redis cache data
                 */
                client.set(cacheKey, JSON.stringify(users), 'EX', process.env.REDIS_CACHE_TIME);
            });
        }
    });
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
        if (req.query.isGroup) {
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

/**
 * Create group chat
 */
exports.postCreateGroup = (req, res, next) => {
    req.checkBody('groupName', 'Vui lòng đặt tên nhóm').notEmpty();

    var errors = req.getValidationResult().then(function(errors) {
		if (!errors.isEmpty()) {
			var errors = errors.mapped();
			return res.json({
                success: false,
                errorCode: '221',
                message: 'Tên nhóm chat không được để trống'
            })
        }

        let newGroup = new ChatGroup();
        newGroup.groupName = req.body.groupName;
        newGroup.status = 1;
        newGroup.createdBy = req.session.user._id;
        newGroup.members.push(req.session.user._id);
        newGroup.save((err, ng) => {
            if (err) {
                console.log('err', err);
                return res.json({
                    success: false,
                    errorCode: '222',
                    message: 'Có lỗi trong quá trình xử lý'
                });
            }
            User.findById(req.session.user._id).exec((err, user) => {
                if (user) {
                    if (!user.groups) {
                        user.groups = [];
                    }
                    user.groups.pull(ng._id);
                    user.groups.push(ng._id);
                    user.save((err, u) => {
                        return res.json({
                            success: true,
                            errorCode: 0,
                            group: newGroup,
                            message: 'Tạo nhóm thành công'
                        })
                    })
                }
            })
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