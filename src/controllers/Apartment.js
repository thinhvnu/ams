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
			'userName': 1,
			'firstName': 1,
			'lastName': 1
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

exports.getEdit = (req, res, next) => {
	ApartmentBuildingGroup.find({}, (err, abgs) => {
		ApartmentBuilding.find({}, (err, abs) => {
			User.find({}, (err, users) => {
				Apartment.findById(req.params.apartmentId)
				.populate({
					path: 'building',
					model: 'ApartmentBuilding',
					populate: {
						path: 'apartmentBuildingGroup',
						model: 'ApartmentBuildingGroup'
					}
				}).exec((err, apartment) => {
					console.log('apartment', apartment);
					res.render('apartment/edit', {
						title: 'Chỉnh sửa căn hộ',
						current: ['apartment', 'edit'],
						users: users,
						abs: abs,
						abgs: abgs,
						data: apartment
					});
				});
			});
		})
	});
}

exports.postUpdate = (req, res, next) => {
	req.checkBody('apartmentName', 'Tên căn hộ không được để trống').notEmpty();
	req.checkBody('apartmentBuildingGroup', 'Chọn khu chung cư').notEmpty();
	req.checkBody('apartmentBuilding', 'Chọn tòa nhà').notEmpty();;
	
	req.getValidationResult().then(function (errors) {
		if (!errors.isEmpty()) {
			var errors = errors.mapped();
			return res.redirect('/apartment/edit/' + req.params.apartmentId);
			// ApartmentBuildingGroup.find({}, (err, abgs) => {
			// 	ApartmentBuilding.find({}, (err, abs) => {
			// 		User.find({}, (err, users) => {
			// 			// res.render('apartment/edit', {
			// 			// 	title: 'Sửa căn hộ',
			// 			// 	users: users,
			// 			// 	abgs: abgs,
			// 			// 	abs: abs,
			// 			// 	errors: errors,
			// 			// 	data: {...req.body, ...{_id: req.params.apartmentId}}
			// 			// });
			// 			return res.redirect('/apartment/edit/' + req.params._id);
			// 		});
			// 	});
			// });
		} else {
			Apartment.findById(req.params.apartmentId).exec((err, apartment) => {
				if (apartment) {
					/**
					 * Remove apartment from building
					 */
					ApartmentBuilding.findById(apartment.building, (err, ab) => {
						// console.log('ab', ab);
						if (ab) {
							ab.apartments.pull(apartment._id);
							ab.save();
						}
					});
					apartment.apartmentName = req.body.apartmentName;
					apartment.buildingGroup = req.body.apartmentBuildingGroup;
					apartment.building = req.body.apartmentBuilding;
					apartment.area = req.body.area;
					apartment.manager = req.body.manager || null;
					apartment.status = req.body.status;
					// apartment.createdBy = req.session.user._id;
					apartment.updatedBy = req.session.user._id;

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
						req.flash('success', 'Đã chỉnh sửa căn hộ ' + a.apartmentName);
						return res.redirect('/apartment');
					});
				} else {
					return res.redirect('/apartment')
				}
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
	let clientKey = 'apartment_view_' + req.params.apartmentId;
	
	client.get(clientKey, (err, a) => {
		if (err) {
			console.log('err', err);
			throw err;
		}
		if (a && process.env.CACHE_ENABLE === 1) {
			a = JSON.parse(a);

			res.render('apartment/view', {
				title: a.apartmentName,
				current: ['apartment', 'view'],
				data: a
			});
		} else {
			Apartment.findById(req.params.apartmentId)
				.populate('manager', {
					'_id': 0,
					'userName': 1,
					'firstName': 1,
					'lastName': 1
				})
				.populate({
					path: 'building',
					model: 'ApartmentBuilding',
					populate: {
						path: 'apartmentBuildingGroup',
						model: 'ApartmentBuildingGroup'
					}
				})
				.populate('users')
				.populate('createdBy', {
					'_id': 0,
					'userName': 1,
					'firstName': 1,
					'lastName': 1
				})
				.exec(function (err, a) {
					if (err) {
						console.log('err', err)
						return next(err);
					}
					User.find({}, (err, users) => {
						res.render('apartment/view', {
							title: a.apartmentName,
							current: ['apartment', 'view'],
							data: a,
							users: users
						});
					})

					/**
					 * Set redis cache data
					 */
					client.set(clientKey, JSON.stringify(a));
				});
		}
	});
}

exports.getDelete = (req, res, nex) => {
	Apartment.findOne({ _id: req.params.apartmentId }, (err, apartment) => {
	  if (err || !apartment) {
		req.flash('errors', 'Xóa căn hộ không thành công');
		return res.redirect('/apartment');
	  } else {
		ApartmentBuilding.findById(apartment.building, (err, ab) => {
			console.log('ab', ab);
			if (ab) {
				ab.apartments.push(apartment._id);
				ab.save((err, result) => {
					apartment.remove((err, r) => {
						req.flash('success', 'Xóa căn hộ thành công');
						return res.redirect('/apartment');
					})
				});
			} else {
				req.flash('errors', 'Xóa căn hộ không thành công');
				return res.redirect('/apartment');
			}
		})
	  }
	})
}