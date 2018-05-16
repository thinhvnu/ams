const ApartmentBuildingGroup = require('../models/ApartmentBuildingGroup');
const ApartmentBuilding = require('../models/ApartmentBuilding');
const Apartment = require('../models/Apartment');
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
			let user = req.session.user;
			ApartmentBuildingGroup.find({
				manager: (user.role === 'ADMIN') ? {$ne: null} : user._id
			})
				.populate('manager', {
					'_id': 0,
					'userName': 1,
					'firstName': 1,
					'lastName': 1
				})
				.populate('createdBy', {
					'_id': 0,
					'userName': 1,
					'firstName': 1,
					'lastName': 1
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

exports.getImportTemplate = (req, res, next) => {
	const XLSX = require('xlsx'), path = require('path');
	let abgData = [], managerData = [], abgWs, managerWs, wb, filePath;

	abgData = [
		['ten_chung_cu', 'quan_ly', 'dia_chi']
	];
	managerData = [
		['id', 'ho_ten', 'sdt']
	];

	abgWs = XLSX.utils.aoa_to_sheet(abgData);

	User.find({})
		.select({
			_id: 1,
			firstName: 1,
			lastName: 1,
			userName: 1,
			phoneNumber: 1
		})
		.exec((err, users) => {
			if (users) {
				for (let i=0; i<users.length; i++) {
					managerData.push([
						users[i]._id,
						users[i].firstName + ' ' + users[i].lastName,
						users[i].phoneNumber
					])
				}
			}

			managerWs = XLSX.utils.aoa_to_sheet(managerData);

			wb = XLSX.utils.book_new();
			filePath = path.join(__dirname, '/../..' + '/media/files/import-template/building-group-import.xlsx');

			XLSX.utils.book_append_sheet(wb, abgWs, "Khu chung cư");
			XLSX.utils.book_append_sheet(wb, managerWs, "Quản lý");
			XLSX.writeFile(wb, filePath);

			return res.json({
				success: true,
				errorCode: 0,
				fileUrl: process.env.MEDIA_URL + '/files/import-template/building-group-import.xlsx'
			});
		})
}

exports.getExportData = (req, res, next) => {
	const XLSX = require('xlsx'), path = require('path');
	let abgData = [], managerData = [], abgWs, managerWs, wb, filePath;

	abgData = [
		['ten_chung_cu', 'quan_ly', 'dia_chi']
	];
	managerData = [
		['id', 'ho_ten', 'sdt']
	];

	abgWs = XLSX.utils.aoa_to_sheet(abgData);

	User.find({})
		.select({
			_id: 1,
			firstName: 1,
			lastName: 1,
			userName: 1,
			phoneNumber: 1
		})
		.exec((err, users) => {
			if (users) {
				for (let i=0; i<users.length; i++) {
					managerData.push([
						users[i]._id,
						users[i].firstName + ' ' + users[i].lastName,
						users[i].phoneNumber
					])
				}
			}

			ApartmentBuildingGroup.find({}).exec((err, abgs) => {
				if (abgs) {
					for (let j=0; j<abgs.length; j++) {
						abgData.push([
							abgs[j].abgName,
							abgs[j].manager,
							abgs[j].address
						])
					}
				}

				managerWs = XLSX.utils.aoa_to_sheet(managerData);

				wb = XLSX.utils.book_new();
				filePath = path.join(__dirname, '/../..' + '/media/files/export/data-building-group.xlsx');

				XLSX.utils.book_append_sheet(wb, abgWs, "Khu chung cư");
				XLSX.utils.book_append_sheet(wb, managerWs, "Quản lý");
				XLSX.writeFile(wb, filePath);

				return res.json({
					success: true,
					errorCode: 0,
					fileUrl: process.env.MEDIA_URL + '/files/export/data-building-group.xlsx'
				});
			});
		})
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
	req.checkBody('manager', 'Chọn quản lý của khu chung cư').notEmpty();
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
			select: {'_id': 1, 'userName': 1, 'firstName': 1, 'lastName': 1}
		})
		.populate({
			path: 'createdBy',
			model: 'User',
			select: {'userName': 1, 'firstName': 1, 'lastName': 1}
		})
		.populate({
			path: 'apartmentBuildings',
			model: 'ApartmentBuilding',
			populate: {
				path: 'manager',
				model: 'User',
				select: { 'userName': 1, 'firstName': 1, 'lastName': 1 }
			}
		})
		.exec(function (err, abg) {
			if (err) {
				console.log('err', err)
				return next(err);
			}
			
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
					model: 'User'
				})
				.populate({
					path: 'createdBy',
					model: 'User'
				})
				.populate({
					path: 'apartmentBuildings',
					model: 'ApartmentBuilding',
					populate: {
						path: 'manager',
						model: 'User',
						select: { 'userName': 1, 'firstName': 1, 'lastName': 1 }
					}
				})
				.exec(function (err, abg) {
					if (err) {
						console.log('err', err)
						return next(err);
					}
					
					User.find({}, (err, users) => {
						res.render('apartment-building-group/view', {
							title: abg.abgName,
							current: ['apartment-building-group', 'view'],
							data: abg,
							users: users
						});
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
	ApartmentBuildingGroup.findOne({_id: req.params.abgId}, (err, abg) => {
		if (err) {
			req.flash('errors', 'Có lỗi xảy ra');
			return res.redirect('/apartment-building-group');
		} else {
			ApartmentBuilding.find({apartmentBuildingGroup: abg._id}).exec((err, buildings) => {
				for (let i=0; i<buildings.length; i++) {
					Apartment.deleteMany({building: {$in: buildings[i].apartments}}, (err, r) => {
						buildings[i].remove();
					});
				}
			})
			abg.remove((err, result) => {
				req.flash('success', 'Xóa thành công');
				res.redirect('/apartment-building-group');
			})
		}
	})
}

exports.getDeleteMany = async (req, res, next) => {
	let deleteIds = JSON.parse(req.params.abgIds);

	let abgs = await ApartmentBuildingGroup.find({
		_id: {
			$in: deleteIds
		}
	});

	for (let i=0; i<abgs.length; i++) {
		let buildings = await ApartmentBuilding.find({apartmentBuildingGroup: abgs[i]._id});
		for (let j=0; j<buildings.length; j++) {
			let a = await Apartment.deleteMany({building: {$in: buildings[j].apartments}});
			await buildings[j].remove();
		}
		await abgs[i].remove();
	}
	req.flash('success', 'Xóa thành công');
	res.redirect('/apartment-building-group');
}