const ApartmentBuildingGroup = require('../models/ApartmentBuildingGroup');
const Cost = require('../models/Cost');

// Get all Categories
exports.getBilling = function (req, res) {
	ApartmentBuildingGroup.find({}).exec((err, abgs) => {
		res.render('payment/billing', {
			title: 'Payment',
			current: ['payment', 'billing'],
			abgs: abgs
		});
	});
};

exports.postBilling = (req, res, next) => {
	
}

exports.getSearch = (req, res, next) => {
	let apartmentId = req.query.apartmentId,
		month = req.query.month,
		year = req.query.year;

	if (apartmentId && month && year) {
		try {
			Cost.find({
				apartment: apartmentId,
				month: month,
				year: year
			})
			.populate({
				path: 'costType',
				model: 'CostType'
			})
			.populate({
				path: 'apartment',
				model: 'Apartment',
				populate: {
					path: 'building',
					model: 'ApartmentBuilding',
					populate: {
						path: 'apartmentBuildingGroup',
						model: 'ApartmentBuildingGroup'
					}
				},
				populate: {
					path: 'manager',
					model: 'User'
				}
			}).exec((err, costs) => {
				return res.json({
					success: true,
					errorCode: 0,
					data: costs
				})
			});
		} catch (e) {

		}
	} else {
		return res.json({
			success: true,
			errorCode: 0,
			data: {}
		})
	}
}
