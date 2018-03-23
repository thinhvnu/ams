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
		if (user && process.env.CACHE_ENABLE === 1) {
			return res.json({
				success: true,
				errorCode: 0,
				data: JSON.parse(user)
			});
		} else {
			User.find({_id: currentUser._id})
			.select({
				'_id': 0,
				'firstName': 1,
				'lastName': 1,
				'userName': 1,
				'phoneNumber': 1,
				'email': 1,
				'gender': 1,
				'avatar': 1,
				'address': 1
			})
			.exec(function (err, user) {
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
	let deviceToken = req.body.token,
		os = req.body.os,
		version = req.body.version,
		deviceName = req.body.deviceName;
	User.findById(currentUser._id, (err, user) => {
		if (err) {
			return res.json({
				success: false,
				errorCode: 111,
				message: JSON.stringify(err)
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
		let deviceInfo = JSON.stringify({
			token: deviceToken,
			os: os,
			version: version,
			deviceName: deviceName
		});
		console.log('req.user', user);
		if (user.firebaseDeviceToken.indexOf(deviceInfo) === -1) {
			user.firebaseDeviceToken.push(deviceInfo);

			user.save((err, u) => {
				if (err) {
					return res.json({
						success: false,
						errorCode: 111,
						message: JSON.stringify(err)
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

exports.postUpdateInfo = (req, res, next) => {
	let userId = req.session.user._id;

	User.findById(userId, (err, user) => {
		if (err) {
			return res.json({
				success: false,
				errorCode: 112,
				message: JSON.stringify(err)
			});
		}

		let data = req.body;
		if (user) {
			user.firstName = data.firstName ? data.firstName : user.firstName;
			user.lastName = data.lastName ? data.lastName : user.lastName;
			user.email = data.email ? data.email : user.email;
			user.phoneNumber = data.phoneNumber ? data.phoneNumber : user.phoneNumber;
			user.gender = data.gender ? data.gender : user.gender;
			user.avatar = data.avatar ? data.avatar : user.avatar;
			user.address = data.address ? data.address : user.address;

			user.save((err, user) => {
				if (err) {
					return res.json({
						success: false,
						errorCode: 112,
						message: JSON.stringify(err)
					});
				}

				return res.json({
					success: true,
					errorCode: 0,
					message: 'Update user info successfully'
				});
			})
		}
	});
}

exports.getSearch = (req, res, next) => {
	try {
		let keyword = req.query.keyword;
		User.find({
			$or: [
				{
					firstName: {
						$regex: new RegExp(keyword, "ig")
					}
				},
				{
					lastName: {
						$regex: new RegExp(keyword, "ig")
					}
				},
			]
		})
		.select({
			_id: 1,
			firstName: 1,
			lastName: 1,
			userName: 1,
			email: 1,
			address: 1
		})
		.exec((err, users) => {
			if (err) {
				return res.json({
					success: false,
					errorCode: '211',
					message: 'Có lỗi xảy ra'
				})
			}

			return res.send({
				success: true,
				errorCode: 0,
				data: users,
				message: 'Query user successfully'
			})
		})
	} catch (e) {
		return res.json({
			success: false,
			errorCode: '111',
			message: 'Exception'
		})
	}
}