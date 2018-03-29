const Notification = require('./../models/Notification');
const Apartment = require('./../models/Apartment');
const NotificationLog = require('./../models/NotificationLog');

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
				var errors = errors.mapped();
				// res.render('room/create', {
				// 	title: 'Create New Room',
				// 	current: ['room', 'create'],
				// 	errors: errors,
				// 	data: req.body
				// });
				return res.json({
					errors: errors
				});
			}

			/*
			* End validate
			*/
			var newNotification = new Notification();
			
			newNotification.title = data.title;
			newNotification.content = data.content;
			if (data.sendTo instanceof Array)
				newNotification.sendTo = data.sendTo;
			else {
				newNotification.sendTo = [];
				newNotification.sendTo.push(data.sendTo);
			}
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
						console.log('apartments', apartments);
						/**
						 * Set cron job send notification
						 */
						// const CronJob = require('cron').CronJob;
						// const dt = new Date(),
						// 	cronTime = (dt.getSeconds() + 2) + ' ' + dt.getMinutes() + ' ' + dt.getHours() + ' ' + dt.getDate() + ' ' + dt.getMonth() + ' ' + dt.getDay();
						
						// let job = new CronJob({
						// 	cronTime: cronTime,
						// 	onTick: function() {
						// 		let fcmTokens = [];
						// 		for(let i=0; i<apartments.length; i++) {
						// 			if (apartments[i].users && apartments[i].users.length > 0) {
						// 				for(let j=0; j<apartments[i].users.length; j++) {
						// 					let user = apartments[i].users[j];
						// 					if (user && user.firebaseDeviceToken && user.firebaseDeviceToken.length > 0) {
						// 						for (let k=0; k<user.firebaseDeviceToken.length; k++) {
						// 							let deviceInfo = JSON.parse(user.firebaseDeviceToken[k]);
						// 							fcmTokens.push(deviceInfo.token);
						// 						}
						// 					}
						// 				}
						// 			}
						// 		}
						// 		Helpers.sendNotification(fcmTokens, notification);
						// 		// console.log('fcmTokens', fcmTokens);
						// 	},
						// 	start: false,
						// 	timeZone: 'Asia/Ho_Chi_Minh'
						// });
						// job.start();
						/*=== End cron ===*/
						/**
						 * Send notification
						 */
						let fcmTokens = [];
						for(let i=0; i<apartments.length; i++) {
							if (apartments[i].users && apartments[i].users.length > 0) {
								for(let j=0; j<apartments[i].users.length; j++) {
									let user = apartments[i].users[j];
									if (user && user.firebaseDeviceToken && user.firebaseDeviceToken.length > 0) {
										for (let k=0; k<user.firebaseDeviceToken.length; k++) {
											let deviceInfo = JSON.parse(user.firebaseDeviceToken[k]);
											fcmTokens.push(deviceInfo.token);

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
											newNotificationLog.status = 1;
											newNotificationLog.save();
										}
									}
								}
							}
						}
						Helpers.sendNotification(fcmTokens, notification);
						/*=== END ===*/
					}
				})

				res.json({
					success: true,
					errorCode: 0,
					message: 'Send notification success fully'
				})
			});
		});
	} catch (e) {
		console.log('e', e);
	}
};

// exports.postSend = (req, res, next) => {
// 	console.log('req.body', req.body);
// }