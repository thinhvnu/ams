const StaticPage = require('../models/StaticPage');

// Get all pages
exports.getIndex = function (req, res) {
	StaticPage.find({}).exec(function (err, staticPages) {
		res.render('static-page/index', {
			title: 'Trang tĩnh',
			current: ['static-page', 'index'],
			data: staticPages
		});
	});
};

exports.getCreate = function (req, res) {
	res.render('static-page/create', {
        title: 'Thêm trang',
        current: ['static-page', 'create']
    });
};

exports.postCreate = function (req, res) {
	/*
	* Validate create category
	*/ 
	req.checkBody('title', 'Tiêu đề không được để trống').notEmpty();
	req.checkBody('content', 'Nội dung không được để trống').notEmpty();
	
	var errors = req.getValidationResult().then(function(errors) {
		if (!errors.isEmpty()) {
			var errors = errors.mapped();
			res.render('static-page/create', {
				title: 'Thêm trang',
				current: ['static-page', 'create'],
				errors: errors,
				data: req.body
			});
		} else {
			var data = req.body;
			var newPage = new StaticPage();
			
			newPage.title = data.title;
            newPage.content = data.content;
            newPage.type = data.type;
			newPage.status = data.status;
			newPage.createdBy = req.session.user._id;
			
			newPage.save(function (err, newPage) {
				if (err) {
					console.log('err', err);
				} else {
					req.flash('success', 'Đã thêm trang ' + newPage.title + ' thành công');
					return res.redirect('/static-page');
				}
			})
		}
	});
};

exports.getEdit = function (req, res) {
	StaticPage.findById(req.params.pageId, (err, data) => {
		if (data) {
			res.render('static-page/edit', {
				title: 'Chỉnh sửa trang',
				current: ['static-page', 'edit'],
				data: data
			});
		} else {
			req.flash('errors', 'Dữ liệu không tìm thấy trên máy chủ');
			return res.redirect('/static-page');
		}
	})
};

exports.postUpdate = function (req, res) {
	/*
	* Validate create category
	*/ 
	req.checkBody('title', 'Tiêu đề không được để trống').notEmpty();
	req.checkBody('content', 'Nội dung không được để trống').notEmpty();
	
	var errors = req.getValidationResult().then(function(errors) {
		if (!errors.isEmpty()) {
			var errors = errors.mapped();
			res.render('static-page/edit', {
				title: 'Chỉnh sửa trang',
				current: ['static-page', 'create'],
				errors: errors,
				data: {...{_id: req.params.pageId}, ...req.body}
			});
		} else {
			var data = req.body;
			StaticPage.findById(req.params.pageId, (err, page) => {
				if (page) {
					page.title = data.title;
                    page.content = data.content;
                    page.type = data.type;
					page.status = data.status;
					page.updatedBy = req.session.user._id;
					
					page.save(function (err, u) {
						if (err) {
							console.log('err', err);
						} else {
							req.flash('success', 'Cập thành công: ' + u.title);
							return res.redirect('/static-page');
						}
					})
				} else {
					req.flash('errors', 'Dữ liệu không tìm thấy trên máy chủ');
					return res.redirect('/static-page');
				}
			});
		}
	});
};

exports.getDelete = (req, res, nex) => {
	StaticPage.remove({ _id: req.params.pageId }, (err) => {
	  if (err) {
		req.flash('errors', 'Xóa trang thành công');
	  } else {
		req.flash('success', 'Xóa trang thành công');
	  }
	  return res.redirect('/static-page');
	})
}