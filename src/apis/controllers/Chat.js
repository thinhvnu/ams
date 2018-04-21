
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./../../models/User');
const ChatGroup = require('./../../models/ChatGroup');
const ChatRecent = require('./../../models/ChatRecent');
const Message = require('./../../models/Message');
const Apartment = require('./../../models/Apartment');
const ApartmentBuilding = require('./../../models/ApartmentBuilding');
const ApartmentBuildingGroup = require('./../../models/ApartmentBuildingGroup');
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
                User.findById(user._id).exec((err, u) => {
                    if (u) {
                        ChatRecent.find({
                            $or: [
                                { sender: u._id },
                                { partner: u._id },
                                {
                                    sender: u._id,
                                    group: {
                                        $in: u.groups
                                    }
                                }
                            ]
                        }).sort('-updatedAt').populate('sender').populate('partner')
                        .populate('group').exec((err, recents) => {
                            let users = [], groups = [], groupIds = [];

                            for (let i=0; i<recents.length; i++) {
                                if (!recents[i].group && recents[i].sender && recents[i].sender.id !== u.id) {
                                    users.push(recents[i].sender.toObject());
                                }
                                if (!recents[i].group && recents[i].partner && recents[i].partner.id !== u.id) {
                                    users.push(recents[i].partner.toObject());
                                }
                                if (recents[i].group) {
                                    groups.push(recents[i].group.toObject());
                                    groupIds.push(recents[i].group._id);
                                }
                            }
                            
                            switch(u.role) {
                                case 'ADMIN':
                                    ChatGroup.find({
                                        _id: {
                                            $nin: groupIds
                                        }
                                    }).sort('-createdAt').exec((err, grs) => {
                                        let count = 0;
                                        let gs = grs ? groups.concat(grs) : groups;
                                        for (let i=0; i<users.length; i++) {
                                            Message.count({
                                                sender: users[i].id,
                                                recipient: u.id,
                                                isRead: false
                                            }).exec((err, c) => {
                                                Object.assign(users[i], {messUnread: c});
                                                count++;

                                                if (count >= (users.length + gs.length)) {
                                                    return res.json({
                                                        success: true,
                                                        errorCode: 0,
                                                        data: {
                                                            users: users,
                                                            groups: gs
                                                        },
                                                        message: 'Get list clients successfully'
                                                    })
                                                }
                                            });
                                        }

                                        for (let i=0; i<gs.length; i++) {
                                            Message.count({
                                                recipient: gs[i]._id,
                                                sender: {
                                                    $ne: u._id
                                                },
                                                isRead: false
                                            }).exec((err, gMessUnread) => {
                                                // console.log('gUnread', gMessUnread);
                                                // gs[i].messUnread = gMessUnread;
                                                Object.assign(gs[i], {messUnread: gMessUnread});
                                                count++;

                                                if (count >= (users.length + gs.length)) {
                                                    return res.json({
                                                        success: true,
                                                        errorCode: 0,
                                                        data: {
                                                            users: users,
                                                            groups: gs
                                                        },
                                                        message: 'Get list clients successfully'
                                                    })
                                                }
                                            });
                                        }
                                    })
                                    break;
                                case 'BUILDING_GROUP_MANAGER':
                                    ApartmentBuildingGroup.findOne({manager: u._id}).exec((err, abg) => {
                                        if (abg) {
                                            ChatGroup.find({
                                                buildingGroup: abg._id,
                                                _id: {
                                                    $nin: groupIds
                                                }
                                            }).sort('-createdAt').exec((err, grs) => {
                                                let count = 0;
                                                let gs = grs ? groups.concat(grs) : groups;

                                                for (let i=0; i<users.length; i++) {
                                                    Message.count({
                                                        sender: users[i].id,
                                                        recipient: u.id,
                                                        isRead: false
                                                    }).exec((err, c) => {
                                                        // users[i].messUnread = c;
                                                        Object.assign(users[i], {messUnread: c});
                                                        count++;
        
                                                        if (count >= (users.length + gs.length)) {
                                                            return res.json({
                                                                success: true,
                                                                errorCode: 0,
                                                                data: {
                                                                    users: users,
                                                                    groups: gs
                                                                },
                                                                message: 'Get list clients successfully'
                                                            })
                                                        }
                                                    });
                                                }
        
                                                for (let i=0; i<gs.length; i++) {
                                                    Message.count({
                                                        recipient: gs[i].id,
                                                        sender: {
                                                            $ne: u.id
                                                        },
                                                        isRead: false
                                                    }).exec((err, gMessUnread) => {
                                                        // gs[i].messUnread = gMessUnread;
                                                        Object.assign(gs[i], {messUnread: gMessUnread});
                                                        count++;
        
                                                        if (count >= (users.length + gs.length)) {
                                                            return res.json({
                                                                success: true,
                                                                errorCode: 0,
                                                                data: {
                                                                    users: users,
                                                                    groups: gs
                                                                },
                                                                message: 'Get list clients successfully'
                                                            })
                                                        }
                                                    });
                                                }
                                                // return res.json({
                                                //     success: true,
                                                //     errorCode: 0,
                                                //     data: {
                                                //         users: users,
                                                //         groups: grs ? groups.concat(grs) : groups
                                                //     },
                                                //     message: 'Get list clients successfully'
                                                // })
                                            })
                                        } else {
                                            let count = 0;
                                            
                                            for (let i=0; i<users.length; i++) {
                                                Message.count({
                                                    sender: users[i].id,
                                                    recipient: u.id,
                                                    isRead: false
                                                }).exec((err, c) => {
                                                    // users[i].messUnread = c;
                                                    Object.assign(users[i], {messUnread: c});
                                                    count++;
    
                                                    if (count >= (users.length)) {
                                                        return res.json({
                                                            success: true,
                                                            errorCode: 0,
                                                            data: {
                                                                users: users,
                                                                groups: []
                                                            },
                                                            message: 'Get list clients successfully'
                                                        })
                                                    }
                                                });
                                            }
                                        }
                                    })
                                    break;
                                case 'BUILDING_MANAGER':
                                    ApartmentBuilding.findOne({manager: u._id}).exec((err, ab) => {
                                        if (ab) {
                                            ChatGroup.find({
                                                building: ab._id,
                                                _id: {
                                                    $nin: groupIds
                                                }
                                            }).sort('-createdAt').exec((err, grs) => {
                                                let count = 0;
                                                let gs = grs ? groups.concat(grs) : groups;

                                                for (let i=0; i<users.length; i++) {
                                                    Message.count({
                                                        sender: users[i].id,
                                                        recipient: u.id,
                                                        isRead: false
                                                    }).exec((err, c) => {
                                                        // users[i].messUnread = c;
                                                        Object.assign(users[i], {messUnread: c});
                                                        count++;
        
                                                        if (count >= (users.length + gs.length)) {
                                                            return res.json({
                                                                success: true,
                                                                errorCode: 0,
                                                                data: {
                                                                    users: users,
                                                                    groups: gs
                                                                },
                                                                message: 'Get list clients successfully'
                                                            })
                                                        }
                                                    });
                                                }
        
                                                for (let i=0; i<gs.length; i++) {
                                                    Message.count({
                                                        recipient: gs[i].id,
                                                        sender: {
                                                            $ne: u.id
                                                        },
                                                        isRead: false
                                                    }).exec((err, gMessUnread) => {
                                                        // gs[i].messUnread = gMessUnread;
                                                        Object.assign(gs[i], {messUnread: gMessUnread});
                                                        count++;
        
                                                        if (count >= (users.length + gs.length)) {
                                                            return res.json({
                                                                success: true,
                                                                errorCode: 0,
                                                                data: {
                                                                    users: users,
                                                                    groups: gs
                                                                },
                                                                message: 'Get list clients successfully'
                                                            })
                                                        }
                                                    });
                                                }
                                            })
                                        } else {
                                            let count = 0;
                                            
                                            for (let i=0; i<users.length; i++) {
                                                Message.count({
                                                    sender: users[i].id,
                                                    recipient: u.id,
                                                    isRead: false
                                                }).exec((err, c) => {
                                                    // users[i].messUnread = c;
                                                    Object.assign(users[i], {messUnread: c});
                                                    count++;
    
                                                    if (count >= (users.length)) {
                                                        return res.json({
                                                            success: true,
                                                            errorCode: 0,
                                                            data: {
                                                                users: users,
                                                                groups: []
                                                            },
                                                            message: 'Get list clients successfully'
                                                        })
                                                    }
                                                });
                                            }
                                        }
                                    })
                                    break;
                                default:
                                    ChatGroup.find({
                                        building: u.building,
                                        _id: {
                                            $nin: groupIds
                                        }
                                    }).sort('-createdAt').exec((err, grs) => {
                                        let count = 0;
                                        let gs = grs ? groups.concat(grs) : groups;

                                        for (let i=0; i<users.length; i++) {
                                            Message.count({
                                                sender: users[i].id,
                                                recipient: u.id,
                                                isRead: false
                                            }).exec((err, c) => {
                                                // users[i].messUnread = c;
                                                Object.assign(users[i], {messUnread: c});
                                                count++;

                                                if (count >= (users.length + gs.length)) {
                                                    return res.json({
                                                        success: true,
                                                        errorCode: 0,
                                                        data: {
                                                            users: users,
                                                            groups: gs
                                                        },
                                                        message: 'Get list clients successfully'
                                                    })
                                                }
                                            });
                                        }

                                        for (let i=0; i<gs.length; i++) {
                                            console.log('u', u);
                                            Message.count({
                                                recipient: gs[i].id,
                                                sender: {
                                                    $ne: u._id
                                                },
                                                isRead: false
                                            }).exec((err, gMessUnread) => {
                                                // gs[i].messUnread = gMessUnread;
                                                Object.assign(gs[i], {messUnread: gMessUnread});
                                                count++;

                                                if (count >= (users.length + gs.length)) {
                                                    console.log('groups', gs);
                                                    return res.json({
                                                        success: true,
                                                        errorCode: 0,
                                                        data: {
                                                            users: users,
                                                            groups: gs
                                                        },
                                                        message: 'Get list clients successfully'
                                                    })
                                                }
                                            });
                                        }
                                    });
                                    break;
                            }
                        })
                    }
                });
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
            console.log('ttt', req.session.user._id, req.params.roomId);
            Message.find({
                isRead: false,
                recipient: req.params.roomId,
                sender: {
                    $ne: req.session.user._id
                }
            }, {isRead: true}, (err, result) => {
                console.log('result', result);
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
            // Message.updateMany({
            //     isRead: false,
            //     recipient: req.params.roomId,
            //     sender: {
            //         $ne: (req.session.user._id || req.session.user.id)
            //     }
            // }, {isRead: true}, (err, result) => {
            //     console.log('result', result);
            //     if (err) {
            //         return res.json({
            //             success: false,
            //             errorCode: '112',
            //             message: 'An error happend'
            //         })
            //     } else {
            //         return res.json({
            //             success: true,
            //             errorCode: 0,
            //             message: 'Updated successfully'
            //         })
            //     }
            // })
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
        User.findOne({role: 'ADMIN'}).exec((err, userAdmin) => {
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
                // return res.json(1);
                if (err) {
                    console.log('err', err);
                    return res.json({
                        success: false,
                        errorCode: '222',
                        message: 'Có lỗi trong quá trình xử lý'
                    });
                }
                ApartmentBuilding.findById(ng.building).populate('apartmentBuildingGroup').exec((err, building) => {
                    if (building) {
                        let groupMembers = [];
                        groupMembers.push(building.manager);
                        groupMembers.push(building.apartmentBuildingGroup.manager);
                        groupMembers.push(req.session.user._id);

                        ng.members.pull(building.manager);
                        ng.members.push(building.manager);
                        ng.members.pull(building.apartmentBuildingGroup.manager);
                        ng.members.push(building.apartmentBuildingGroup.manager);
                        ng.save((err) => {
                            if (userAdmin) {
                                userAdmin.groups.pull(ng._id);
                                userAdmin.groups.push(ng._id);
                                userAdmin.save((err, result) => {
                                    res.json({
                                        success: true,
                                        errorCode: 0,
                                        group: newGroup,
                                        message: 'Tạo nhóm thành công'
                                    })
                                })
                            } else {
                                res.json({
                                    success: true,
                                    errorCode: 0,
                                    group: newGroup,
                                    message: 'Tạo nhóm thành công'
                                })
                            }
                        });

                        User.find({
                            _id: {
                                $in: groupMembers
                            }
                        }).exec((err, users) => {
                            for (let i=0; i<users.length; i++) {
                                if (!users[i].groups) {
                                    users[i].groups = [];
                                }
                                users[i].groups.pull(ng._id);
                                users[i].groups.push(ng._id);
                                users[i].save();
                            }
                        })
                    } else {
                        ng.remove();
                        req.flash('errors', 'Tạo nhóm thất bại');
                        return res.redirect('/');
                    }
                });
                // User.findById(req.session.user._id).exec((err, user) => {
                //     if (user) {
                //         /* Join user create group */
                //         if (!user.groups) {
                //             user.groups = [];
                //         }
                //         user.groups.pull(ng._id);
                //         user.groups.push(ng._id);
                //         user.save((err, u) => {
                //             if (userAdmin) {
                //                 userAdmin.groups.pull(ng._id);
                //                 userAdmin.groups.push(ng._id);
                //                 userAdmin.save((err, result) => {
                //                     return res.json({
                //                         success: true,
                //                         errorCode: 0,
                //                         group: newGroup,
                //                         message: 'Tạo nhóm thành công'
                //                     })
                //                 })
                //             } else {
                //                 return res.json({
                //                     success: true,
                //                     errorCode: 0,
                //                     group: newGroup,
                //                     message: 'Tạo nhóm thành công'
                //                 })
                //             }
                //         })
                //     }
                // })
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
            User.findById(req.session.user._id)
            .populate({
                path: 'building',
                model: 'ApartmentBuilding',
                populate: {
                    path: 'manager',
                    model: 'User'
                }
            }).exec((err, user) => {
                if (user && user.building) {
                    return res.json({
                        success: true,
                        errorCode: 0,
                        data: user.building.manager
                    })
                } else {
                    return res.json({
                        success: true,
                        errorCode: 0,
                        data: {}
                    });
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