const CostType = require('../models/CostType');

// Get all Categories
exports.getIndex = function (req, res) {
	CostType.find({}).populate({
		path: 'createdBy',
		model: 'User'
	}).exec(function (err, costTypes) {
		if (err) {
			console.log('err', err)
			return res.json({
				success: false,
				errorCode: '121',
				message: 'Lỗi không xác định'
			})
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

exports.getEdit = function (req, res) {
	CostType.findById(req.params.costTypeId, (err, data) => {
		if (data) {
			res.render('cost-type/edit', {
				title: 'Sửa loại chi phí',
				current: ['cost', 'cost-type'],
				data: data
			});
		} else {
			req.flash('errors', 'Dữ liệu không tìm thấy trên máy chủ');
			return res.redirect('/cost-type');
		}
	})
};

exports.postUpdate = (req, res, next) => {
	/*
	* Validate create cost type
	*/ 
	req.checkBody('name', 'Tên chi phí không được để trống').notEmpty();
	req.checkBody('icon', 'Icon không được để trống').notEmpty();

	var errors = req.getValidationResult().then(function(errors) {
		if (!errors.isEmpty()) {
			var errors = errors.mapped();
			return res.render('cost-type/edit', {
				title: 'Thêm chi phí',
				current: ['cost', null],
				errors: errors,
				data: {...{_id: req.params.costTypeId}, ...req.body},
			});;
		}

		/*
		* End validate
		*/
		CostType.findById(req.params.costTypeId, (err, costType) => {
			if (costType) {
				costType.name = req.body.name;
				costType.icon = req.body.icon;
				costType.status = req.body.status;
				costType.updatedBy = req.session.user._id;
				// save the user
				costType.save(function (err) {
					
					if (err) {
						console.log('Error in Saving: ' + err);
						return res.send({ "result": false });
					}
					req.flash('success', 'Cập nhật dữ liệu thành công');
					return res.redirect('/cost-type');
				});
			} else {
				req.flash('errors', 'Cập nhật dữ liệu thất bại');
				return res.redirect('/cost-type');
			}
		})
	});
}

exports.getDelete = (req, res, nex) => {
	CostType.remove({ _id: req.params.costTypeId }, (err) => {
	  if (err) {
		req.flash('errors', 'Xóa loại chi phí không thành công');
	  } else {
		req.flash('success', 'Xóa loại chi phí thành công');
	  }
	  return res.redirect('/cost-type');
	})
}