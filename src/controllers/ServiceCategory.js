const ServiceCategory = require('../models/ServiceCategory');
const Service = require('../models/Service');
const ServiceRequest = require('../models/ServiceRequest');

// Get all posts
exports.getIndex = function (req, res) {
	ServiceCategory.find({}).exec(function (err, data) {
		if (err) {
			console.log('err', err)
			return res.json({
				success: false,
				errorCode: '121',
				message: 'Lỗi không xác định'
			})
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
	ServiceCategory.findOne({ _id: req.params.categoryId }, (err, category) => {
	  if (err || !category) {
		req.flash('errors', 'Xóa dịch vụ không thành công');
		return res.redirect('/service-category');
	  } else {
		if (category) {
			Service.find({category: category._id}).exec((err, services) => {
				let serviceIds = [];
				for (let i=0; i<services.length; i++) {
					serviceIds.push(services[i]._id);
				}
				ServiceRequest.deleteMany({service: {$in: serviceIds}}, (err, result) => {
					Service.deleteMany({_id: {$in: serviceIds}}, (err, r) => {
						console.log('category', category);
						category.remove((err, re) => {
							req.flash('success', 'Xóa danh mục dịch vụ thành công');
							return res.redirect('/service-category');
						})
					})
				})
			})
		}
	  }
	});
}