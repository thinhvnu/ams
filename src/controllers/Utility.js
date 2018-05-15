const Utility = require('../models/Utility');
const UtilityCategory = require('../models/UtilityCategory');

// Get all posts
exports.getIndex = function (req, res) {
	Utility.find({})
	.sort({
		orderDisplay: 1,
		createdAt: -1
	}).populate('category').exec(function (err, utilities) {
		if (err) {
			console.log('err', err)
			return res.json({
				success: false,
				errorCode: '121',
				message: 'Lỗi không xác định'
			})
		}

		UtilityCategory.find({})
		.sort({
			orderDisplay: 1,
			createdAt: -1
		})
		.exec((err, utilityCategories) => {
			res.render('utility/index', {
				title: 'Tiện ích',
				current: ['utility', 'index'],
				utilityCategories: utilityCategories,
				data: utilities
			});
		})
	});
};

exports.getCreate = function (req, res) {
	UtilityCategory.find({
		status: 1
	}).exec((err, categories) => {
		res.render('utility/create', {
			title: 'Thêm tiện ích',
			current: ['utility', 'create'],
			categories: categories
		});
	})
	
};

exports.postCreate = function (req, res) {
	/*
	* Validate create category
	*/ 
	req.checkBody('utilityName', 'Tên tiện ích không được để trống').notEmpty();
	req.checkBody('image', 'Ảnh không được để trống').notEmpty();
	req.checkBody('category', 'Chọn danh mục').notEmpty();
	req.checkBody('content', 'Nội dung không được để trống').notEmpty();
	
	var errors = req.getValidationResult().then(function(errors) {
		if (!errors.isEmpty()) {
			var errors = errors.mapped();
			UtilityCategory.find({
				status: 1
			}).exec((err, categories) => {
				res.render('utility/create', {
					title: 'Thêm tiện ích',
					current: ['utility', 'create'],
					errors: errors,
					data: req.body,
					categories: categories
				});
			})
		} else {
			var data = req.body;
			var newUtility = new Utility();
			
			newUtility.utilityName = data.utilityName;
			newUtility.category = data.category;
			newUtility.image = data.image;
			newUtility.content = data.content;
			newUtility.orderDisplay = data.orderDisplay || 0;
			newUtility.status = data.status;
			newUtility.createdBy = req.session.user._id;
			
			newUtility.save(function (err, newUtility) {
				if (err) {
					console.log('err', err);
				} else {
					req.flash('success', 'Đã thêm tiện ích thành công: ' + newUtility.utilityName);
					return res.redirect('/utility');
				}
			})
		}
	});
};

exports.getEdit = function (req, res) {
	UtilityCategory.find({
		status: 1
	}).exec((err, categories) => {
		Utility.findById(req.params.utilityId, (err, data) => {
			if (data) {
				res.render('utility/edit', {
					title: 'Chỉnh sửa tiện ích',
					current: ['utility', 'edit'],
					categories: categories,
					data: data
				});
			} else {
				req.flash('errors', 'Dữ liệu không tìm thấy trên máy chủ');
				return res.redirect('/utility');
			}
		})
	})
};

exports.postUpdate = function (req, res) {
	/*
	* Validate create category
	*/ 
	req.checkBody('utilityName', 'Tên tiện ích không được để trống').notEmpty();
	req.checkBody('category', 'Chọn danh mục').notEmpty();
	req.checkBody('image', 'Ảnh không được để trống').notEmpty();
	req.checkBody('content', 'Nội dung không được để trống').notEmpty();
	
	var errors = req.getValidationResult().then(function(errors) {
		if (!errors.isEmpty()) {
			var errors = errors.array();
			req.flash('errors', errors[0].msg);
			return res.redirect('/utility/edit/' + req.params.utilityId);
		} else {
			var data = req.body;
			var newUtility = new Utility();
			Utility.findById(req.params.utilityId, (err, utility) => {
				if (utility) {
					utility.utilityName = data.utilityName;
					utility.category = data.category;
					utility.image = data.image;
					utility.content = data.content;
					utility.orderDisplay = data.orderDisplay || 0;
					utility.status = data.status;
					utility.updatedBy = req.session.user._id;
					
					utility.save(function (err, u) {
						if (err) {
							console.log('err', err);
						} else {
							req.flash('success', 'Cập nhật tiện ích thành công: ' + u.utilityName);
							return res.redirect('/utility');
						}
					})
				} else {
					req.flash('errors', 'Dữ liệu không tìm thấy trên máy chủ');
					return res.redirect('/utility');
				}
			});
		}
	});
};

exports.getDelete = (req, res, nex) => {
	Utility.remove({ _id: req.params.utilityId }, (err) => {
	  if (err) {
		req.flash('errors', 'Xóa tiện ích không thành công');
	  } else {
		req.flash('success', 'Xóa tiện ích thành công');
	  }
	  return res.redirect('/utility');
	})
}