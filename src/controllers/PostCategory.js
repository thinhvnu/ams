const PostCategory = require('../models/PostCategory');
const Post = require('../models/Post');

// Get all posts
exports.getIndex = function (req, res) {
	PostCategory.find({}).sort({
		orderDisplay: 1,
		updatedAt: -1
	}).exec(function (err, data) {
		if (err) {
			console.log('err', err)
			return done(err);
		}
		
		res.render('post-category/index', {
			title: 'Cộng đồng',
			current: ['post-category', 'index'],
			data: data
		});
	});
};

exports.getCreate = function (req, res) {
	res.render('post-category/create', {
        title: 'Thêm cộng đồng mới',
        current: ['post-category', 'create']
    });
};

exports.postCreate = function (req, res) {
	/*
	* Validate create category
	*/ 
	req.checkBody('name', 'Tên cộng đồng không được để trống').notEmpty();
	req.checkBody('icon', 'Icon cộng đồng không được để trống').notEmpty();
	
	var errors = req.getValidationResult().then(function(errors) {
		if (!errors.isEmpty()) {
			var errors = errors.mapped();
			res.render('post-category/create', {
				title: 'Thêm cộng đồng mới',
				current: ['post-category', 'create'],
				errors: errors,
				data: req.body
			});
		} else {
			var data = req.body;
			var newPostCategory = new PostCategory();
			
			newPostCategory.name = data.name;
			newPostCategory.icon = data.icon;
			newPostCategory.status = data.status;
			newPostCategory.orderDisplay = data.orderDisplay;
			newPostCategory.createdBy = req.session.user._id;
			
			newPostCategory.save(function (err, newPostCategory) {
				if (err) {
					console.log('err', err);
				} else {
					// Save tags
					req.flash('success', 'Đã thêm cộng đồng thành công: ' + newPostCategory.name);
					return res.redirect('/post-category');
				}
			})
		}
	});
};

exports.getEdit = function (req, res) {
	PostCategory.findById(req.params.categoryId).exec((err, data) => {
		res.render('post-category/edit', {
			title: 'Chỉnh sửa cộng đồng',
			current: ['post-category', 'edit'],
			data: data
		});
	});
};

exports.postUpdate = function (req, res) {
	/*
	* Validate create category
	*/ 
	req.checkBody('name', 'Tên cộng đồng không được để trống').notEmpty();
	req.checkBody('icon', 'Icon cộng đồng không được để trống').notEmpty();
	
	var errors = req.getValidationResult().then(function(errors) {
		if (!errors.isEmpty()) {
			req.flash('errors', 'Có lỗi trong quá trình cập nhật');
			return res.redirect('/post-category/edit/' + req.params.categoryId);
		} else {
			var data = req.body;
			PostCategory.findById(req.params.categoryId).exec((err, postCategory) => {
				postCategory.name = data.name;
				postCategory.icon = data.icon;
				postCategory.status = data.status;
				postCategory.orderDisplay = data.orderDisplay;
				postCategory.updatedBy = req.session.user._id;
				
				postCategory.save(function (err, newPostCategory) {
					if (err) {
						console.log('err', err);
					} else {
						// Save tags
						req.flash('success', 'Dữ liệu cộng đồng đã được cập nhật: ' + postCategory.name);
						return res.redirect('/post-category');
					}
				})
			})
		}
	});
};

exports.getDelete = (req, res, nex) => {
	PostCategory.findOne({ _id: req.params.postCategoryId }, (err, postCategory) => {
	  if (err || !postCategory) {
        req.flash('errors', 'Xóa cộng đồng không thành công');
        return res.redirect('/post-category');
	  } else {
        Post.deleteMany({category: postCategory._id}, (err, result) => {
            postCategory.remove((err, r) => {
                req.flash('success', 'Xóa cộng đồng thành công');
                return res.redirect('/post-category');
            })
        })
	  }
	})
}