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
					path: 'manager',
					model: 'User',
				}
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

exports.getUpdateStatus = (req, res, next) => {
	let status = req.query.status;
	let costIds = req.query.costIds;

	if (status && costIds) {
		Cost.updateMany({
			_id: {$in: [ '5ac0aa8308599958b9eb21e8', '5ac0aa4808599958b9eb21e7' ]}
		}, {'$set': {
			status: status
		}}, function(err) {
			if(err) {
				return res.json({
					success: false,
					errorCode: '121',
					message: 'Update failed'
				})
			}
			return res.json({
				success: true,
				errorCode: 0,
				message: 'Update successfully'
			})
		});
	} else {
		return res.json({
			success: false,
			errorCode: '121',
			message: 'Update failed'
		})
	}
}
