const UtilityCategory = require('../models/UtilityCategory');
const Utility = require('../models/Utility');

// Get all posts
exports.getIndex = function (req, res) {
	UtilityCategory.find({}).exec(function (err, data) {
		if (err) {
			console.log('err', err)
			return res.json({
				success: false,
				errorCode: '121',
				message: 'Lỗi không xác định'
			})
		}
		
		res.render('utility-category/index', {
			title: 'Danh mục tiện ích',
			current: ['utility', 'index'],
			data: data
		});
	});
};

exports.getCreate = function (req, res) {
	res.render('utility-category/create', {
        title: 'Thêm danh mục tiện ích mới',
        current: ['utility-category', 'create']
    });
};

exports.postCreate = function (req, res) {
	/*
	* Validate create category
	*/ 
	req.checkBody('name', 'Tên danh mục không được để trống').notEmpty();
	// req.checkBody('icon', 'Icon danh mục không được để trống').notEmpty();
	
	var errors = req.getValidationResult().then(function(errors) {
		if (!errors.isEmpty()) {
			var errors = errors.mapped();
			res.render('utility-category/create', {
				title: 'Thêm danh mục tiện ích mới',
				current: ['utility', 'create'],
				errors: errors,
				data: req.body
			});
		} else {
			var data = req.body;
			var newUtilityCategory = new UtilityCategory();
			
			newUtilityCategory.name = data.name;
			newUtilityCategory.icon = data.icon;
			newUtilityCategory.status = data.status;
			newUtilityCategory.createdBy = req.session.user._id;
			
			newUtilityCategory.save(function (err, newUtilityCategory) {
				if (err) {
					console.log('err', err);
				} else {
					// Save tags
					req.flash('success', 'Đã thêm danh mục tiện ích thành công: ' + newUtilityCategory.name);
					return res.redirect('/utility-category');
				}
			})
		}
	});
};

exports.getEdit = function (req, res) {
	UtilityCategory.findById(req.params.categoryId).exec((err, category) => {
		if (category) {
			res.render('utility-category/edit', {
				title: 'Sửa danh mục tiện ích',
				current: ['utility-category', 'edit'],
				data: category
			});
		} else {
			req.flash('errors', 'Không tìm thấy danh mục tiện ích');
			return res.redirect('/utility');
		}
	})
};

exports.postUpdate = function (req, res) {
	/*
	* Validate create category
	*/ 
	req.checkBody('name', 'Tên danh mục không được để trống').notEmpty();
	// req.checkBody('icon', 'Icon danh mục không được để trống').notEmpty();
	
	var errors = req.getValidationResult().then(function(errors) {
		if (!errors.isEmpty()) {
			var errors = errors.array();
			console.log('errors', errors);
			req.flash('errors', errors[0].msg);
			return res.redirect('/utility-category/edit/' + req.params.categoryId);
		} else {
			var data = req.body;
			UtilityCategory.findById(req.params.categoryId).exec((err, category) => {
				if (category) {
					category.name = data.name;
					category.icon = data.icon;
					category.status = data.status;
					category.updatedBy = req.session.user._id;
					
					category.save(function (err, category) {
						if (err) {
							console.log('err', err);
						} else {
							// Save tags
							req.flash('success', 'Đã cập nhật danh mục tiện ích thành công: ' + category.name);
							return res.redirect('/utility-category');
						}
					})
				} else {
					req.flash('errors', 'Không tìm thấy dữ liệu');
					return res.redirect('/utility-category');
				}
			})
		}
	});
};

exports.getDelete = (req, res, nex) => {
	UtilityCategory.findOne({ _id: req.params.categoryId }, (err, category) => {
	  if (err || !category) {
		req.flash('errors', 'Xóa danh mục tiện ích không thành công');
		return res.redirect('/utility-category');
	  } else {
		if (category) {
			Utility.deleteMany({category: category._id}).exec((err, r) => {
				category.remove((err, re) => {
                    req.flash('success', 'Xóa danh mục tiện ích thành công');
                    return res.redirect('/utility-category');
                })
			})
		}
	  }
	});
}