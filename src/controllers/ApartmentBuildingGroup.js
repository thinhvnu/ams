const ApartmentBuildingGroup = require('../models/ApartmentBuildingGroup');
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
		if (abgs) {
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
				.populate('createdAt', {
					'_id': 0,
					'userName': 1
				})
				.exec(function (err, abgs) {
					if (err) {
						console.log('err', err)
						return done(err);
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
	console.log('req.session', req.session);
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
			abg.createdAt = req.session.user._id;
			abg.updatedAt = req.session.user._id;

			console.log('req.body', abg);

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