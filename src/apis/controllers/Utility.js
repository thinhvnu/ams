const Utility = require('./../../models/Utility');

// Get all utilities
exports.getIndex = function (req, res) {
	Utility.find({}, {
		'_id': 1,
		'utilityName': 1,
		'image': 1,
		'imageUrl': 1,
		'content': 1
	})
	.exec(function (err, utilities) {
		if (err) {
			console.log('err', err)
			return done(err);
		}
		res.send({
			success: true,
			errorCode: 0,
			data: utilities,
			message: 'Get list utilities successfully'
		});
	});
};