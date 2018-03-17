const Utility = require('../models/Utility');

// Get all posts
exports.getIndex = function (req, res) {
	Utility.find({}).exec(function (err, utilities) {
		if (err) {
			console.log('err', err)
			return done(err);
		}
		
		res.render('utility/index', {
			title: 'Tiện ích',
			current: ['utility', 'index'],
			data: utilities
		});
	});
};

exports.getCreate = function (req, res) {
	res.render('utility/create', {
        title: 'Thêm tiện ích',
        current: ['utility', 'create']
    });
};

exports.postCreate = function (req, res) {
	/*
	* Validate create category
	*/ 
	req.checkBody('utilityName', 'Tên tiện ích không được để trống').notEmpty();
	req.checkBody('image', 'Ảnh không được để trống').notEmpty();
	req.checkBody('content', 'Nội dung không được để trống').notEmpty();
	
	var errors = req.getValidationResult().then(function(errors) {
		if (!errors.isEmpty()) {
			var errors = errors.mapped();
			res.render('utility/create', {
				title: 'Thêm tiện ích',
				current: ['utility', 'create'],
				errors: errors,
				data: req.body
			});
		} else {
			var data = req.body;
			var newUtility = new Utility();
			
			newUtility.utilityName = data.utilityName;
			newUtility.image = data.image;
			newUtility.content = data.content;
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