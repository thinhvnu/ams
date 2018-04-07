const CostType = require('../models/CostType');

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
		res.render('cost-type/index', {
			title: 'Loại chi phí',
			current: ['cost', null],
			data: costTypes
		});
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
	req.checkBody('icon', 'Icon không được để trống').notEmpty();

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
		costType.icon = req.body.icon;
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