const Notification = require('./../models/Notification');
const Apartment = require('./../models/Apartment');
const NotificationLog = require('./../models/NotificationLog');

// Get all Categories
exports.getIndex = function (req, res) {
	
};

exports.getCreate = function (req, res) {
	
};

exports.postCreate = function (req, res) {
	let data = req.body;
	console.log('req', req.body);
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
					/**
					 * Set cron job send notification
					 */
					const CronJob = require('cron').CronJob;
					const dt = new Date(),
						cronTime = (dt.getSeconds() + 1) + ' ' + dt.getMinutes() + ' ' + dt.getHours() + ' ' + dt.getDate() + ' ' + dt.getMonth() + ' ' + dt.getDay();
					console.log('cronTime', cronTime);
					let job = new CronJob({
						cronTime: cronTime,
						onTick: function() {
							console.log('cronjob running', new Date());
						},
						start: false,
						timeZone: 'Asia/Ho_Chi_Minh'
					});
					job.start();
					 /*=== End cron ===*/
				}
			})

			return res.json({
				success: true,
				errorCode: 0,
				message: 'Send notification success fully'
			})
		});
	});
};

// exports.postSend = (req, res, next) => {
// 	console.log('req.body', req.body);
// }