const ApartmentBuildingGroup = require('../models/ApartmentBuildingGroup');
const ApartmentBuilding = require('../models/ApartmentBuilding');
const User = require('../models/User');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

// Get all apartment building group
exports.getIndex = function (req, res, next) {
	client.get('get_list_abgs', (err, abgs) => {
		if (err) {
			console.log('err', err);
			throw err;
		}
		if (abgs && process.env.CACHE_ENABLE === 1) {
			res.render('apartment-building-group/index', {
				title: 'Danh sách khu chung cư',
				current: ['apartment-building-group', 'index'],
				data: JSON.parse(abgs)
			});
		} else {
			ApartmentBuildingGroup.find({})
				.populate('manager', {
					'_id': 0,
					'userName': 1
				})
				.populate('createdBy', {
					'_id': 0,
					'userName': 1
				})
				.exec(function (err, abgs) {
					if (err) {
						console.log('err', err)
						return next(err);
					}

					res.render('apartment-building-group/index', {
						title: 'Danh sách khu chung cư',
						current: ['apartment-building-group', 'index'],
						data: abgs
					});

					/**
					 * Set redis cache data
					 */
					client.set('get_list_abgs', JSON.stringify(abgs));
				});
		}
	});
}

exports.getCreate = (req, res, next) => {
	User.find({}, (err, users) => {
		res.render('apartment-building-group/create', {
			title: 'Thêm khu chung cư',
			current: ['apartment-building-group', 'create'],
			users: users
		});
	});
}

exports.postCreate = (req, res, next) => {
	req.checkBody('abgName', 'Tên khu chung cư không được để trống').notEmpty();
	req.checkBody('manager', 'Chọn quản lý').notEmpty();
	req.checkBody('address', 'Địa chỉ không được để trống').notEmpty();
	
	req.getValidationResult().then(function (errors) {
		if (!errors.isEmpty()) {
			var errors = errors.mapped();

			console.log('err', errors);
			User.find({}, (err, users) => {
				res.render('apartment-building-group/create', {
					title: 'Thêm khu chung cư',
					users: users,
					errors: errors,
					data: req.body
				});
			})
		} else {
			const abg = new ApartmentBuildingGroup();
			abg.abgName = req.body.abgName;
			abg.address = req.body.address;
			abg.manager = req.body.manager;
			abg.status = req.body.status;
			abg.createdBy = req.session.user._id;
			abg.updatedBy = req.session.user._id;

			abg.save((err) => {
				if (err) {
					console.log('error create new abg', err);
					return next(err);
				}
				client.del('get_list_abgs', () => {
					res.redirect('/apartment-building-group');
				})
			});
		}
	});
}

exports.getEdit = (req, res, next) => {
	ApartmentBuildingGroup.findById(req.params.abgId)
		.populate({
			path: 'manager',
			model: 'User',
			select: {'_id': 1, 'userName': 1}
		})
		.populate({
			path: 'createdBy',
			model: 'User',
			select: {'userName': 1}
		})
		.populate({
			path: 'apartmentBuildings',
			model: 'ApartmentBuilding',
			populate: {
				path: 'manager',
				model: 'User',
				select: { 'userName': 1 }
			}
		})
		.exec(function (err, abg) {
			if (err) {
				console.log('err', err)
				return next(err);
			}
			console.log('manager', abg.manager._id);
			User.find({}, (err, users) => {
				res.render('apartment-building-group/edit', {
					title: abg.abgName,
					current: ['apartment-building-group', 'edit'],
					users: users,
					data: abg
				});
			})
		});
}

exports.postUpdate = (req, res, next) => {
	req.checkBody('abgName', 'Tên khu chung cư không được để trống').notEmpty();
	req.checkBody('manager', 'Chọn quản lý').notEmpty();
	req.checkBody('address', 'Địa chỉ không được để trống').notEmpty();
	
	req.getValidationResult().then(function (errors) {
		if (!errors.isEmpty()) {
			var errors = errors.mapped(), data = Object.assign(req.body, {id: req.params.abgId});

			console.log('err', errors);
			User.find({}, (err, users) => {
				return res.render('apartment-building-group/edit', {
					title: 'Cập nhật dữ liệu khu chung cư',
					current: ['apartment-building-group', 'edit'],
					users: users,
					errors: errors,
					data: req.body
				});
			})
		} else {
			ApartmentBuildingGroup.findById(req.params.abgId, (err, abg) => {
				if (err) {
					req.flash('errors', 'Cập nhật dữ liệu không thành công');
					return res.redirect('/apartment-building-group/edit/' + req.params.abgId);
				}

				abg.abgName = req.body.abgName;
				abg.address = req.body.address;
				abg.manager = req.body.manager;
				abg.status = req.body.status;
				abg.updatedBy = req.session.user._id;

				abg.save((err) => {
					if (err) {
						req.flash('errors', 'Cập nhật dữ liệu không thành công');
						return res.redirect('/apartment-building-group/edit/' + req.params.abgId);
					}
					req.flash('success', 'Cập nhật dữ liệu thành công');
					return res.redirect('/apartment-building-group');
				});
			})
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
	let clientKey = 'abg_view_' + req.params.abgId;
	console.log('abgId', req.params.abgId);
	client.get(clientKey, (err, abg) => {
		if (err) {
			console.log('err', err);
			throw err;
		}
		if (abg && process.env.CACHE_ENABLE == 1) {
			abg = JSON.parse(abg);

			res.render('apartment-building-group/view', {
				title: abg.abgName,
				current: ['apartment-building-group', 'view'],
				data: abg
			});
		} else {
			ApartmentBuildingGroup.findById(req.params.abgId)
				.populate({
					path: 'manager',
					model: 'User',
					select: {'userName': 1}
				})
				.populate({
					path: 'createdBy',
					model: 'User',
					select: {'userName': 1}
				})
				.populate({
					path: 'apartmentBuildings',
					model: 'ApartmentBuilding',
					populate: {
						path: 'manager',
						model: 'User',
						select: { 'userName': 1 }
					}
				})
				.exec(function (err, abg) {
					if (err) {
						console.log('err', err)
						return next(err);
					}
					console.log('abg', abg);
					res.render('apartment-building-group/view', {
						title: abg.abgName,
						current: ['apartment-building-group', 'view'],
						data: abg
					});

					/**
					 * Set redis cache data
					 */
					client.set(clientKey, JSON.stringify(abg));
				});
		}
	});
}

exports.getDelete = (req, res, next) => {
	ApartmentBuildingGroup.remove({_id: req.params.abgId}, (err) => {
		if (err) {
			req.flash('errors', 'Có lỗi xảy ra');
		} else {
			req.flash('success', 'Xóa thành công');
		}
		return res.redirect('/apartment-building-group');
	})
}