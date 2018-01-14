const jwt = require('jsonwebtoken');
const User = require('./../../models/User');
const Message = require('./../../models/Message');

/**
 * GET /api/chat/clients
 */
exports.getClients = (req, res, next) => {
    let user = req.session.user;
    console.log('user', user);
    User.find({_id: { $ne: user._id }}, (err, users) => {
        if (err) {
            return res.json({
                success: false,
                errorCode: 0004,
                message: 'Error'
            });
        } else {
            return res.json({
                success: true,
                errorCode: 0,
                data: users,
                message: 'Get list clients successfully'
            });
        }
    });
};

exports.getMessages = (req, res, next) => {
    let page = 1, pageSize = 10;

    if (req.query) {
        if (req.query.page) {
            page = req.query.page - 1;
        }
        if (req.query.pageSize) {
            pageSize = parseInt(req.query.pageSize);
        }
    }

    console.log('pageSize', page, pageSize);
    Message.find({
        $or:[ {'recipient': req.params.roomId}, {'sender': req.params.roomId} ]
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
        '_id': 0,
        'avatar': 1,
		'userName': 1,
    })
    .exec(function (err, messages) {
		if (err) {
            console.log('err', err);
			return res.json({
                success: false,
                errorCode: 0004,
                message: 'Error'
            });
		} else {
            return res.json({
                success: true,
                errorCode: 0,
                data: messages,
                message: 'Get message successfully'
            });
        }
	});
}