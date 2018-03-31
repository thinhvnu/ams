const CostType = require('../models/CostType');
const Cost = require('../models/Cost');
const Abg = require('../models/ApartmentBuildingGroup');
const ApartmentBuilding = require('../models/ApartmentBuilding');
const Apartment = require('../models/Apartment');

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
	console.log('req.query', req.query);
	let buildingId = req.query.buildingId;

	if (!buildingId) {
		return res.json({
			success: false,
			errorCode: '432'
		});
	}

	const XLSX = require('xlsx'), path = require('path');
	let costData = [], costWs, filePath;

	costData = [
		['loai_chi_phi', 'can_ho', 'chung_cu', 'so_tien', 'thang', 'nam']
	];

	/**
	 * Query data building
	 */
	ApartmentBuilding.find({
		_id: buildingId
	})
	.populate({
		path: 'buildingGroup',
		model: 'ApartmentBuildingGroup'
	})
	.populate({
		path: 'apartments',
		model: 'Apartment'
	})
	.exec((err, apartments) => {
		console.log('apartments', apartments);
		/**
		 * Append data to worksheet
		 */
		for (let i=0; i<apartments.length; i++) {
			costData.push(
				[
					'Tien dien',
					'101',
					'Khu chung cu my dinh',
					'100000',
					'12',
					'2017'
				]
			)
		}

		costWs = XLSX.utils.aoa_to_sheet(costData);

		wb = XLSX.utils.book_new();
		filePath = path.join(__dirname, '/../..' + '/media/files/import-template/chi-phi-dich-vu.xlsx');

		XLSX.utils.book_append_sheet(wb, costWs, "Chi Phí");
		XLSX.writeFile(wb, filePath);

		return res.json({
			success: true,
			errorCode: 0,
			fileUrl: process.env.MEDIA_URL + '/files/import-template/chi-phi-dich-vu.xlsx'
		});
	})
}
