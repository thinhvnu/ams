const roles = require('../../libs/roles');
const User = require('../../models/User');
const Notification = require('../../models/Notification');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

exports.postRegister = (req, res, next) => {
	try {
		req.checkBody('firstName', 'Vui lòng cung cấp họ tên').notEmpty();
		req.checkBody('lastName', 'Vui lòng cung cấp họ tên').notEmpty();
		req.checkBody('phoneNumber', 'Vui lòng nhập số điện thoại').notEmpty();
		req.checkBody('apartmentAddress', 'Vui lòng nhập địa chỉ').notEmpty();
		req.checkBody('password', 'Mật khẩu ít nhất 6 kí tự').len(6);
		req.checkBody('confirmPassword', 'Mật khẩu không trùng khớp').equals(req.body.password);
		req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });
		
		req.getValidationResult().then(function(errors) {
		  	if (!errors.isEmpty()) {
				var errors = errors.array();

				return res.json({
					success: false,
					errorCode: '011',
					errors: JSON.stringify(errors),
					data: req.body,
					message: 'Validate errors'
				})
		  	} else {
				const user = new User();
				user.firstName = req.body.firstName;
				user.lastName = req.body.lastName;
				user.userName = req.body.userName ? req.body.userName : req.body.phoneNumber;
				user.email = req.body.email;
				user.avatar = req.body.avatar;
				user.phoneNumber = req.body.phoneNumber;
				user.role = roles.obj.RESIDENT;
				user.password = req.body.password;
				if (req.body.building)
					user.building = req.body.building;
				user.birthDay = req.body.birthDay;
				user.gender = req.body.gender;
				user.apartmentAddress = req.body.apartmentAddress;
				user.status = 0;
			
				User.findOne({ 
					phoneNumber: req.body.phoneNumber
				}, (err, existingUser) => {
					if (err) { 
						return res.json({
							success: false,
							errorCode: '013',
							message: 'Có lỗi xảy ra' + JSON.stringify(err)
						});
					}
					if (existingUser) {
						return res.json({
							success: false,
							errorCode: '012',
							message: 'Người dùng đã tồn tại'
						});
					}
					user.save((err, u) => {
						if (err) { 
							return res.json({
								success: false,
								errorCode: '013',
								message: 'Có lỗi xảy ra' + JSON.stringify(err)
							});
						}
						
						User.find({
							role: 'ADMIN'
						}).exec((err, admins) => {
							for (let i=0; i<admins.length; i++) {
								let newNoti = new Notification();
								newNoti.title = 'Tài khoản đăng ký mới ' + user.firstName + ' ' + user.lastName,
								newNoti.recipient = admins[i]._id;
								newNoti.building = null,
								newNoti.buildingGroup = null;
								newNoti.type = 4;
								newNoti.objId = u._id;
								newNoti.save((err, nt) => {
									console.log('new noti', newNoti);
									try {
										global.io.to(admins[i]._id).emit('noti_new_user', nt);
									} catch (e) {

									}
								});
							}
						})
						res.json({
							success: true,
							errorCode: 0,
							message: 'Đăng ký tài khoản thành công'
						});
					});
				});
		  	}
		});
	} catch (e) {
		return res.json({
			success: false,
			errorCode: '111',
			message: 'Server exception'
		})
	}
}
// Get all active sliders
exports.getInfo = function (req, res) {
	try {
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
					'_id': 1,
					'firstName': 1,
					'lastName': 1,
					'userName': 1,
					'birthDay': 1,
					'phoneNumber': 1,
					'email': 1,
					'gender': 1,
					'avatar': 1,
					'avatarUrl': 1,
					'address': 1,
					'apartmentAddress': 1
				})
				.exec(function (err, user) {
					if (err) {
						console.log('err', err)
						return res.json({
							success: false,
							errorCode: '121',
							message: 'Lỗi không xác định'
						})
					}
					
					res.json({
						success: true,
						errorCode: 0,
						data: user
					});
				});
			};
		});
	} catch (e) {
		return res.json({
			success: false,
			errorCode: '111',
			data: {},
			message: 'Exception'
		})
	}
};

exports.postFirebaseDeviceToken = (req, res, next) => {
	try {
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

			// Add firebase device token when login new device
			let deviceInfo = JSON.stringify({
				token: deviceToken,
				os: os,
				version: version,
				deviceName: deviceName
			});

			if (user.firebaseDeviceToken.indexOf(deviceInfo) === -1) {
				user.firebaseDeviceToken.pull(deviceInfo);
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
	} catch (e) {
		return res.json({
			success: false,
			errorCode: '111',
			message: 'Exception'
		})
	}
}

exports.postUpdateInfo = (req, res, next) => {
	try {
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
				// return res.json(user);
				user.firstName = data.firstName ? data.firstName : user.firstName;
				user.lastName = data.lastName ? data.lastName : user.lastName;
				user.email = data.email ? data.email : user.email;
				user.phoneNumber = data.phoneNumber ? data.phoneNumber : user.phoneNumber;
				user.gender = data.gender ? data.gender : user.gender;
				user.avatar = data.avatar ? data.avatar : user.avatar;
				user.birthDay = data.birthDay ? data.birthDay : user.birthDay;
				user.apartmentAddress = data.apartmentAddress ? data.apartmentAddress : user.apartmentAddress;
				user.address = data.address ? data.address : user.address;

				user.save((err, u) => {
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
			} else {
				if (err) {
					return res.json({
						success: false,
						errorCode: 112,
						message: 'Nguoi dung khong ton tai'
					});
				}
			}
		});
	} catch (e) {
		return res.json({
			success: false,
			errorCode: '111',
			message: 'Exception'
		})
	}
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
		}).exec((err, users) => {
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

exports.deleteTokenFirebase = (req, res, next) => {
	try {

		let firebaseToken = req.params.token_firebase;

		User.findById(req.session.user._id).exec(function (err, userFined) {

			
			console.log('err', err)
			if (err) {
				return res.json({
					success: false,
					errorCode: '011',
					message: err,
				});
			}

			
				if (userFined) {
					console.log('userFined', userFined)

					// let deviceInfo = JSON.stringify({
					//   token: deviceToken,
					//   os: os,
					//   version: version,
					//   deviceName: deviceName
					// });
					let arrTokenFirebase = userFined.firebaseDeviceToken;
					console.log('arrTokenFirebase', arrTokenFirebase)
					if (arrTokenFirebase) {
						console.log('arrTokenFirebase2', arrTokenFirebase)
						for (var i = 0; i < arrTokenFirebase.length; i++) {
							if (arrTokenFirebase[i].token === firebaseToken) {
								arrTokenFirebase.splice(i, 1);
								break;
							}

						}
					}

					userFined.firebaseDeviceToken = arrTokenFirebase;
					console.log('userFined', userFined)
					userFined.save(function (err, result) {
						console.log('err', err)
						console.log('result', result)
						if (err) {
							return res.json({
								success: false,
								errorCode: '011',
								message: err,
							});
						}
						return res.send({
							success: true,
							errorCode: 0,
							data: result,
							message: 'remove token firebase success'
						});



					})
				} else {
					console.log("dmm,mmmmmmmmmmmmmmmmmmmmmmmmm")
					return res.json({
						success: false,
						errorCode: '002',
						message: 'Không tìm thấy id thông báo'
					})
				}
		});

	
	} catch (e) {
		return res.json({
			success: false,
			errorCode: '111',
			data: [],
			message: 'Server exception'
		})
	}
}

exports.postChangePassword = (req, res, next) => {
	try {
		req.checkBody('oldPassword', 'Nhập mật khẩu cũ').notEmpty();
		req.checkBody('newPassword', 'Nhập mật khẩu mới').notEmpty();
		req.checkBody('confirmNewPassword', 'Mật khẩu không trùng khớp').equals(req.body.newPassword);

		req.getValidationResult().then(function (errors) {
			if (!errors.isEmpty()) {
				return res.json({
					success: false,
					errorCode: '112',
					message: 'Validate errors',
					errors: JSON.stringify(errors.array())
				})
			} else {
				User.findById(req.session.user).exec((err, user) => {
					if (user) {
						user.comparePassword(req.body.oldPassword, (err, isMatch) => {
							if (!isMatch) {
								return res.json({
									success: 'false',
									errorCode: '113',
									message: 'Mật khẩu cũ không đúng'
								})
							} else {
								user.password = req.body.newPassword;
								user.save((err, result) => {
									return res.json({
										success: true,
										errorCode: true,
										message: 'Thay đổi mật khẩu thành công'
									})
								})
							}
						})
					} else {
						return res.json({
							success: false,
							errorCode: '121',
							message: 'Người dùng không tồn tại'
						})
					}
				})
			}
		});
	} catch (e) {
		return res.json({
			success: false,
			errorCode: '111',
			message: 'Lỗi không xác định'
		})
	}
}

exports.getLogout = (req, res, next) => {
	req.session.destroy();
	return res.json({
		success: true,
		errorCode: 0,
		message: 'Logout successfully'
	})
}