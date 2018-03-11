const Service = require('./../../models/Service');

// Get all services
exports.getIndex = function (req, res) {
	Service.find({}, {
		'_id': 1,
		'serviceName': 1,
		'image': 1,
		'imageUrl': 1,
		'content': 1
	})
	.exec(function (err, services) {
		if (err) {
			console.log('err', err)
			return done(err);
		}
		res.send({
			success: true,
			errorCode: 0,
			data: services,
			message: 'Get list services successfully'
		});
	});
};