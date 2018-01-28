const User = require('../../models/User');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

// Get all active sliders
exports.getInfo = function (req, res) {
    let currentUser = req.session.user;
    let clientKey = 'user_info_' + currentUser._id;

	client.get(clientKey, (err, user) => {
		if (err) {
			console.log('err', err);
			throw err;
		}
		if (user) {
			return res.json({
				success: true,
				errorCode: 0,
				data: JSON.parse(user)
			});
		} else {
			User.find({_id: currentUser._id}, {
				'userName': 1,
			}).exec(function (err, user) {
				if (err) {
					console.log('err', err)
					return done(err);
				}
				
				res.json({
					success: true,
					errorCode: 0,
					data: user
				});
				/**
				 * Set redis cache data
				 */
				client.set(clientKey, JSON.stringify(user), 'EX', process.env.REDIS_CACHE_TIME);
			});
		}
	});
};

exports.postFirebaseDeviceToken = (req, res, next) => {
	let currentUser = req.session.user;
	let deviceToken = req.body.token;

	User.findById(currentUser.id, (err, user) => {
		if (err) {
			return res.json({
				success: false,
				errorCode: 111,
				message: 'Error happen'
			});
		}

		if (!deviceToken) {
			return res.json({
				success: false,
				errorCode: 112,
				message: 'Device token is required'
			});
		}

		// Add firebase device token when log in new device
		if (user.firebaseDeviceToken.indexOf(deviceToken) === -1) {
			user.firebaseDeviceToken.push(deviceToken);

			user.save((err, u) => {
				if (err) {
					return res.json({
						success: false,
						errorCode: 111,
						message: 'Error happen'
					});
				}
				return res.json({
					success: true,
					errorCode: 0,
					message: 'Update device token successfully'
				});
			})
		} else {
			return res.json({
				success: true,
				errorCode: 0,
				message: 'Update device token successfully'
			});
		}
	})
}