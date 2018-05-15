const UtilityCategory = require('./../../models/UtilityCategory');
const Utility = require('./../../models/Utility');

// Get all utilities
exports.getIndex = function (req, res) {
	UtilityCategory.find({status: 1}).sort({
		orderDisplay: 1,
		createdAt: -1
	}).exec((err, categories) => {
		let count = 0, data = [];
		if (categories.length === 0) {
			return res.json({
				success: true,
				errorCode: 0,
				data: [],
				message: 'Get list utilities successfully'
			});
		}
		for (let i=0; i<categories.length; i++) {
			data[i] = categories[i].toObject();
			Utility.find({category: categories[i]._id}).sort({
				createdAt: -1
			}).exec(function (err, utilities) {
				if (err) {
					console.log('err', err)
					return res.json({
						success: false,
						errorCode: '121',
						message: 'Lỗi không xác định'
					})
				}
				data[count] = {...data[i], ...{utilities: utilities}};
				count++;
				if (count >= categories.length) {
					res.json({
						success: true,
						errorCode: 0,
						data: data,
						message: 'Get list utilities successfully'
					});
				}
			});
		}
	});
};