const ServiceCategory = require('../models/ServiceCategory');

// Get all posts
exports.getIndex = function (req, res) {
	ServiceCategory.find({}).exec(function (err, data) {
		if (err) {
			console.log('err', err)
			return done(err);
		}
		
		res.render('service-category/index', {
			title: 'Danh mục dịch vụ',
			current: ['service', 'index'],
			data: data
		});
	});
};

exports.getCreate = function (req, res) {
	res.render('service-category/create', {
        title: 'Thêm danh mục dịch vụ mới',
        current: ['service', 'create']
    });
};

exports.postCreate = function (req, res) {
	/*
	* Validate create category
	*/ 
	req.checkBody('name', 'Tên danh mục không được để trống').notEmpty();
	req.checkBody('icon', 'Icon danh mục không được để trống').notEmpty();
	
	var errors = req.getValidationResult().then(function(errors) {
		if (!errors.isEmpty()) {
			var errors = errors.mapped();
			res.render('service-category/create', {
				title: 'Thêm danh mục dịch vụ mới',
				current: ['service', 'create'],
				errors: errors,
				data: req.body
			});
		} else {
			var data = req.body;
			var newServiceCategory = new ServiceCategory();
			
			newServiceCategory.name = data.name;
			newServiceCategory.icon = data.icon;
			newServiceCategory.status = data.status;
			newServiceCategory.createdBy = req.session.user._id;
			
			newServiceCategory.save(function (err, newServiceCategory) {
				if (err) {
					console.log('err', err);
				} else {
					// Save tags
					req.flash('success', 'Đã thêm danh mục dịch vụ thành công: ' + newServiceCategory.name);
					return res.redirect('/service-category');
				}
			})
		}
	});
};

exports.getDelete = (req, res, nex) => {
	Service.remove({ _id: req.params.serviceId }, (err) => {
	  if (err) {
		req.flash('errors', 'Xóa dịch vụ không thành công');
	  } else {
		req.flash('success', 'Xóa dịch vụ thành công');
	  }
	  return res.redirect('/service-category');
	})
}