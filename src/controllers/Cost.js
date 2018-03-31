const CostType = require('../models/CostType');
const Cost = require('../models/Cost');
const Abg = require('../models/ApartmentBuildingGroup');

// Get all Categories
exports.getIndex = function (req, res) {
	CostType.find({}).populate({
		path: 'createdBy',
		model: 'User'
	}).exec(function (err, costTypes) {
		if (err) {
			console.log('err', err)
			return done(err);
		}
		Abg.find({
			
		}, (err, abgs) => {
			res.render('cost/index', {
				title: 'Chi phí',
				current: ['cost', null],
				costTypes: costTypes,
				abgs: abgs
			});
		})
	});
};

exports.getCreate = function (req, res) {
	res.render('cost-type/create', {
		title: 'Thêm loại chi phí',
		current: ['cost', 'cost type']
	});
};

exports.postCreate = function (req, res) {
	/*
	* Validate create cost type
	*/ 
  req.checkBody('name', 'Tên chi phí không được để trống').notEmpty();

	var errors = req.getValidationResult().then(function(errors) {
		if (!errors.isEmpty()) {
			var errors = errors.mapped();
			return res.render('cost-type/create', {
				title: 'Thêm chi phí',
				current: ['cost', null],
				errors: errors,
				data: req.body,
			});;
		}

		/*
		* End validate
		*/
		var costType = new CostType();
	
		costType.name = req.body.name;
		costType.status = req.body.status;
		costType.createdBy = req.session.user._id;
		// save the user
		costType.save(function (err) {
			console.log('costype', err);
			if (err) {
				console.log('Error in Saving: ' + err);
				return res.send({ "result": false });
			}
			return res.redirect('/cost-type');
		});
	});
};

exports.getImportTemplate = (req, res, next) => {
	const XLSX = require('xlsx'), path = require('path');
	let costData = [], managerData = [], abgWs, managerWs, wb, filePath;

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
			filePath = path.join(__dirname, '/../..' + '/media/files/import-template/chi-phi-dich-vu.xlsx');

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
