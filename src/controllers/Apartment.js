const Apartment = require('../models/Apartment');
const ApartmentBuilding = require('../models/ApartmentBuilding');
const ApartmentBuildingGroup = require('../models/ApartmentBuildingGroup');
const User = require('../models/User');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

// Get all apartment building
exports.getIndex = function (req, res, next) {
	Apartment.find({})
		.populate('manager', {
			'_id': 1,
			'userName': 1
		})
		.populate({
			path: 'building',
			model: 'ApartmentBuilding',
			select: {
				'_id': 1,
				'buildingName': 1
			},
			populate: {
				path: 'apartmentBuildingGroup',
				model: 'ApartmentBuildingGroup',
				select: { 'abgName': 1 }
			}
		})
		.populate('createdBy', {
			'_id': 0,
			'userName': 1
		})
		.exec(function (err, apartments) {
			if (err) {
				console.log('err', err)
				return next(err);
			}

			res.render('apartment/index', {
				title: 'Danh sách tòa nhà',
				current: ['apartment', 'index'],
				data: apartments
			});
		});
}

exports.getCreate = (req, res, next) => {
	ApartmentBuildingGroup.find({}, (err, abgs) => {
		User.find({}, (err, users) => {
			res.render('apartment/create', {
				title: 'Thêm căn hộ',
				current: ['apartment', 'create'],
				users: users,
				abgs: abgs
			});
		});
	});
}

exports.postCreate = (req, res, next) => {
	req.checkBody('apartmentName', 'Tên căn hộ không được để trống').notEmpty();
	req.checkBody('apartmentBuildingGroup', 'Chọn khu chung cư').notEmpty();
	req.checkBody('apartmentBuilding', 'Chọn tòa nhà').notEmpty();;
	
	req.getValidationResult().then(function (errors) {
		if (!errors.isEmpty()) {
			var errors = errors.mapped();

			ApartmentBuildingGroup.find({}, (err, abgs) => {
				User.find({}, (err, users) => {
					res.render('apartment/create', {
						title: 'Thêm căn hộ',
						users: users,
						abgs: abgs,
						errors: errors,
						data: req.body
					});
				});
			});
		} else {
			const apartment = new Apartment();
			apartment.apartmentName = req.body.apartmentName;
			apartment.buildingGroup = req.body.apartmentBuildingGroup;
			apartment.building = req.body.apartmentBuilding;
			apartment.area = req.body.area;
			apartment.manager = req.body.manager || null;
			apartment.status = req.body.status;
			apartment.createdBy = req.session.user._id;
			// apartmentBuilding.updatedBy = req.session.user._id;

			apartment.save((err, a) => {
				if (err) {
					console.log('error create new abg', err);
					return next(err);
				}
				/**
				 * Save to apartment building group
				 */
				ApartmentBuilding.findById(a.building, (err, ab) => {
					console.log('ab', ab);
					if (ab) {
						ab.apartments.push(a._id);
						ab.save();
					}
				})
				req.flash('success', 'Đã thêm căn hộ ' + a.apartmentName);
				return res.redirect('/apartment');
			});
		}
	});
}

/**
 * 
 * @param {*} req : abgId
 * @param {*} res 
 * @param {*} next 
 */
exports.getView = (req, res, next) => {
	let clientKey = 'ab_view_' + req.params.abId;
	
	client.get(clientKey, (err, ab) => {
		if (err) {
			console.log('err', err);
			throw err;
		}
		if (ab && process.env.CACHE_ENABLE === 1) {
			ab = JSON.parse(abg);

			res.render('apartment-building/view', {
				title: ab.buildingName,
				current: ['apartment-building', 'view'],
				data: ab
			});
		} else {
			ApartmentBuilding.findById(req.params.abId)
				.populate('manager', {
					'_id': 0,
					'userName': 1
				})
				.populate('apartmentBuildingGroup', {
					'_id': 0,
					'abgName': 1
				})
				// .populate({
				// 	path: 'apartments',
				// 	model: 'Apartment',
				// 	populate: {
				// 		path: 'manager',
				// 		model: 'User',
				// 		select: { 'userName': 1 }
				// 	}
				// })
				.populate('createdBy', {
					'_id': 0,
					'userName': 1
				})
				.exec(function (err, ab) {
					if (err) {
						console.log('err', err)
						return next(err);
					}
			
					res.render('apartment-building/view', {
						title: ab.buildingName,
						current: ['apartment-building', 'view'],
						data: ab
					});

					/**
					 * Set redis cache data
					 */
					client.set(clientKey, JSON.stringify(ab));
				});
		}
	});
}