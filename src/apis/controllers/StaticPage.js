const StaticPage = require('./../../models/StaticPage');

// Get all utilities
exports.getPolicy = function (req, res) {
	StaticPage.findOne({type: 1})
	.exec(function (err, policy) {
		res.send({
			success: true,
			errorCode: 0,
			data: policy
		});
	});
};

exports.getAboutUs = function (req, res) {
	StaticPage.findOne({type: 2})
	.exec(function (err, aboutUs) {
		res.send({
			success: true,
			errorCode: 0,
			data: aboutUs
		});
	});
};