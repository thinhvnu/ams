const Notification = require('./../models/Notification');
const Apartment = require('./../models/Apartment');
const NotificationLog = require('./../models/NotificationLog');
const ServiceRequest = require('./../models/ServiceRequest');
const FeedBack = require('./../models/FeedBack');

/**
 * Helpers function
 */
const Helpers = require('./../helpers/common');

// Get all Categories
exports.getIndex = function (req, res) {
	
};

exports.getCreate = function (req, res) {
	
};

exports.postCreate = function (req, res) {
	try {
		let data = req.body;
		/*
		* Validate
		*/ 
		req.checkBody('title', 'Nhập tiêu đề thông báo').notEmpty();
		req.checkBody('content', 'Nhập nội dung thông báo').notEmpty();
		req.checkBody('sendTo', 'Chọn căn hộ cần gửi thông báo').notEmpty();

		var errors = req.getValidationResult().then(function(errors) {
			if (!errors.isEmpty()) {
				var errors = errors.array();
				// res.render('room/create', {
				// 	title: 'Create New Room',
				// 	current: ['room', 'create'],
				// 	errors: errors,
				// 	data: req.body
				// });
				req.flash('errors', errors[0].msg);
				if (req.query.buildingId) {
					return res.redirect('/apartment-building/view/' + req.query.buildingId);
				} else {
					return res.redirect('/');
				}
			}

			/*
			* End validate
			*/
			var newNotification = new Notification();
			
			newNotification.title = data.title;
			newNotification.description = data.description;
			newNotification.content = data.content;
			if (data.sendTo instanceof Array)
				newNotification.sendTo = data.sendTo;
			else {
				newNotification.sendTo = [];
				newNotification.sendTo.push(data.sendTo);
			}
			newNotification.type = 1;
			newNotification.createdBy = req.session.user._id;
			// save the user
			newNotification.save(function (err, notification) {
				if (err) {
					return res.json({
						success: false,
						errorCode: '121',
						message: 'Send notification failed'
					})
				}
				
				Apartment.find({
					_id: {
						$in: notification.sendTo
					}
				})
				.populate({
					path: 'users',
					model: 'User'
				})
				.exec((err, apartments) => {
					if (apartments) {
						/**
						 * Send notification
						 */
						let androidFcmTokens = [], iosFcmTokens = [];
						for(let i=0; i<apartments.length; i++) {
							if (apartments[i].users && apartments[i].users.length > 0) {
								for(let j=0; j<apartments[i].users.length; j++) {
									let user = apartments[i].users[j];
									if (user && user.firebaseDeviceToken && user.firebaseDeviceToken.length > 0) {
										for (let k=0; k<user.firebaseDeviceToken.length; k++) {
											let deviceInfo = JSON.parse(user.firebaseDeviceToken[k]);
											if (deviceInfo.os === 'android') {
												androidFcmTokens.push(deviceInfo.token);
											} else {
												iosFcmTokens.push(deviceInfo.token);
											}
											/**
											 * save log
											 */
											let newNotificationLog = new NotificationLog();
											newNotificationLog.notification = notification._id;
											newNotificationLog.sendTo = user._id,
											newNotificationLog.device = user.firebaseDeviceToken[k];
											newNotificationLog.apartment = apartments[i]._id;
											newNotificationLog.building = apartments[i].building;
											newNotificationLog.buildingGroup = apartments[i].buildingGroup;
											if (k === 0) {
												newNotificationLog.isFirst = true;
											}
											newNotificationLog.status = 1;
											newNotificationLog.save();
										}
									}
								}
							}
						}
						Helpers.sendAndroidNotification(androidFcmTokens, notification);
						Helpers.sendIosNotification(iosFcmTokens, notification);
						/*=== END ===*/
					}
				})

				req.flash('success', 'Gửi thông báo thành công');
				res.redirect('/');
			});
		});
	} catch (e) {
		console.log('e', e);
	}
};

exports.getView = (req, res, next) => {
	Notification.findById(req.params.notiId).exec((err, notification) => {
		if (notification) {
			notification.status = 1;
			notification.save((err) => {
				if (notification.type == 2) {
					ServiceRequest.findById(notification.objId)
					.populate({
						path: 'service',
						model: 'Service'
					}).exec((err, sr) => {
						if (!sr) {
							req.flash('errors', 'Yêu cầu dịch vụ đã bị xóa');
						}
						res.render('notification/view', {
							type: 2,
							data: sr || null
						})
					})
				} else if (notification.type == 3 || notification.type == 5) {
					FeedBack.findById(notification.objId)
					.populate('createdBy').exec((err, fb) => {
						if (!fb) {
							req.flash('errors', 'Không tìm thấy dữ liệu');
						}
						res.render('notification/view', {
							type: 3,
							data: fb || null
						})
					})
				} else if (notification.type == 4) {
					res.redirect('/user/edit/' + notification.objId);
				} else {
					req.flash('errors', 'Không tìm thấy dữ liệu');
					res.render('notification/view', {
						data: null
					})
				}
			});
		} else {
			req.flash('errors', 'Yêu cầu dịch vụ đã bị xóa');
			res.render('notification/view', {
				data: null
			})
		}
	})
}

exports.getSendFireWarning = async (req, res, next) => {
	try {
		let fb = await FeedBack.findById(req.params.fbId).populate('createdBy');
		/*
		* End validate
		*/
		Apartment.find({
			building: fb.createdBy.building
		})
		.populate({
			path: 'users',
			model: 'User'
		})
		.exec((err, apartments) => {
			if (apartments) {
				/**
				 * Send notification
				 */
				let androidFcmTokens = [], iosFcmTokens = [];
				for(let i=0; i<apartments.length; i++) {
					if (apartments[i].users && apartments[i].users.length > 0) {
						for(let j=0; j<apartments[i].users.length; j++) {
							let user = apartments[i].users[j];
							if (user && user.firebaseDeviceToken && user.firebaseDeviceToken.length > 0) {
								for (let k=0; k<user.firebaseDeviceToken.length; k++) {
									let deviceInfo = JSON.parse(user.firebaseDeviceToken[k]);
									if (deviceInfo.os === 'android') {
										androidFcmTokens.push(deviceInfo.token);
									} else {
										iosFcmTokens.push(deviceInfo.token);
									}
									/**
									 * save log
									 */
									let newNotificationLog = new NotificationLog();
									newNotificationLog.notification = 'Có cháy, cư dân di tản';
									newNotificationLog.sendTo = user._id,
									newNotificationLog.device = user.firebaseDeviceToken[k];
									newNotificationLog.apartment = apartments[i]._id;
									newNotificationLog.building = apartments[i].building;
									newNotificationLog.buildingGroup = apartments[i].buildingGroup;
									if (k === 0) {
										newNotificationLog.isFirst = true;
									}
									newNotificationLog.status = 1;
									newNotificationLog.save();
								}
							}
						}
					}
				}
				Helpers.sendAndroidNotification(androidFcmTokens, {
					title: 'Có cháy, cư dân di tản',
					description: 'Có cháy, cư dân di tản'
				});
				Helpers.sendIosNotification(iosFcmTokens, {
					title: 'Có cháy, cư dân di tản',
					description: 'Có cháy, cư dân di tản'
				});
				/*=== END ===*/
			}
		})

		req.flash('success', 'Gửi thông báo cảnh báo cháy thành công');
		res.redirect('/');
	} catch (e) {
		req.flash('errors', 'Gửi thông báo thất bại');
		res.redirect('/feedback?flag=1');
	}
}

// exports.postSend = (req, res, next) => {
// 	console.log('req.body', req.body);
// }