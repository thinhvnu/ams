const jwt = require('jsonwebtoken');
const User = require('./../../models/User');
const Message = require('./../../models/Message');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

/**
 * GET /api/chat/clients
 */
exports.getClients = (req, res, next) => {
    console.log('userttt', req.session.user);
    let user = req.session.user,
        cacheKey = 'clients_' + user._id;

    console.log('cacheKey', cacheKey);
    client.get(cacheKey, (err, users) => {
        if (err) {
			console.log('err', err);
			throw err;
        }
        
        if (users) {
			return res.json({
                success: true,
                errorCode: 0,
                data: JSON.parse(users),
                message: 'Get list clients successfully'
            });
		} else {
            User.find({_id: { $ne: user._id }}, (err, users) => {
                if (err) {
                    return res.json({
                        success: false,
                        errorCode: 0004,
                        message: 'Error'
                    });
                } else {
                    /**
                     * Set redis cache data
                     */
                    client.set(cacheKey, JSON.stringify(users), 'EX', process.env.REDIS_CACHE_TIME);

                    return res.json({
                        success: true,
                        errorCode: 0,
                        data: users,
                        message: 'Get list clients successfully'
                    });
                }
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
                data: messages.reverse(),
                message: 'Get message successfully'
            });
        }
	});
}