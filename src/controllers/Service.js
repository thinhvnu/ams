const Service = require('../models/Service');
const ServiceCategory = require('../models/ServiceCategory');

exports.getIndex = function (req, res) {
	Service.find({}).exec(function (err, services) {
		if (err) {
			console.log('err', err)
			return done(err);
		}
		
		res.render('service/index', {
			title: 'Tất cả dịch vụ',
			current: ['service', 'index'],
			data: services
		});
	});
};

exports.getCreate = function (req, res) {
	ServiceCategory.find({
		status: 1
	}).exec((err, categories) => {
		res.render('service/create', {
			title: 'Thêm dịch vụ mới',
			current: ['service', 'create'],
			categories: categories
		});
	})
};

exports.postCreate = function (req, res) {
	/*
	* Validate create category
	*/ 
	req.checkBody('serviceName', 'Tên dịch vụ không được để trống').notEmpty();
	req.checkBody('icon', 'Icon dịch vụ không được để trống').notEmpty();
	req.checkBody('category', 'Danh mục dịch vụ không được để trống').notEmpty();
	req.checkBody('content', 'Nội dung không được để trống').notEmpty();
	
	var errors = req.getValidationResult().then(function(errors) {
		if (!errors.isEmpty()) {
			var errors = errors.mapped();
			ServiceCategory.find({
				status: 1
			}).exec((err, categories) => {
				res.render('service/create', {
					title: 'Thêm dịch vụ mới',
					current: ['service', 'create'],
					errors: errors,
					data: req.body,
					categories: categories
				});
			});
		} else {
			var data = req.body;
			var newService = new Service();
			
			newService.serviceName = data.serviceName;
			newService.icon = data.icon;
			newService.image = data.image;
			newService.content = data.content;
			newService.price = data.price;
			newService.status = data.status;
			newService.category = data.category;
			newService.createdBy = req.session.user._id;
			
			newService.save(function (err, newService) {
				if (err) {
					console.log('err', err);
				} else {
					// Save tags
					req.flash('success', 'Đã thêm dịch vụ thành công: ' + newService.serviceName);
					return res.redirect('/service');
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
	  return res.redirect('/service');
	})
  }