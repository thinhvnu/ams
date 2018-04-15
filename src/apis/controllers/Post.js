const PostCategory = require('./../../models/PostCategory');
const Post = require('./../../models/Post');

exports.getCategory = (req, res, next) => {
	PostCategory.find({
		status: 1
	}).sort({
		orderDisplay: 1,
		updatedAt: -1
	}).exec((err, postCategories) => {
		if (err) {
			return res.json({
				success: false,
				errorCode: '112',
				message: 'Có lỗi xảy ra trong quá trình truy vấn dữ liệu'
			})
		}
		return res.json({
			success: false,
			errorCode: 0,
			data: postCategories,
			message: 'Lấy dữ liệu cộng đồng thành công'
		})
	})
}
// Get all posts
exports.getPostsOfCategory = function (req, res) {
	console.log('categoryId', req.params.categoryId);
	Post.find({
		category: req.params.categoryId
	}, {
		'_id': 1,
		'title': 1,
		'alias': 1,
		'images': 1,
		'imageUrl': 1,
		'description': 1,
		'content': 1,
		'category': 1,
		'likes': 1,
		'comments': 1,
		'tags': 1,
		'seo': 1,
		'createdAt': 1,
		'createdBy': 1
	})
	.populate({
		path: 'createdBy',
		model: 'User',
		select: { '_id': 1, 'avatar': 1, 'userName': 1, 'firstName': 1, 'lastName': 1 }
	})
	// .populate({
	// 	path: 'likes',
	// 	model: 'Like',
	// 	populate: {
	// 		path: 'createdBy',
	// 		model: 'User',
	// 		select: { '_id': 0, 'avatar': 1, 'userName': 1, 'firstName': 1, 'lastName': 1 }
	// 	}
	// })
	.populate({
		path: 'comments',
		model: 'Comment',
		populate: {
			path: 'createdBy',
			model: 'User',
			select: { '_id': 0, 'avatar': 1, 'userName': 1, 'firstName': 1, 'lastName': 1 }
		}
	})
	.sort('-createdAt')
	.exec(function (err, posts) {
		if (err) {
			return res.json({
				success: false,
				errorCode: '112',
				data: [],
				message: 'Xảy ra lỗi trong quá trình truy vấn dữ liệu: ' + JSON.stringify(err)
			})
		}
		res.send({
			success: true,
			errorCode: 0,
			data: posts,
			message: 'Get list post successfully'
		});
	});
};

exports.postCreateNew = (req, res, next) => {
	req.checkBody('content', 'Nội dung không được để trống').notEmpty();
	req.checkBody('category', 'Chọn cộng đồng của bài viết').notEmpty();
	
    var errors = req.getValidationResult().then(function(errors) {
		console.log('errors', errors);
		if (!errors.isEmpty()) {
            return res.json({
                success: false,
                errorCode: '010',
                message: errors.array(),
                data: req.body
            });
		} else {
			var data = req.body;
			var newPost = new Post();
			
			newPost.title = data.title;
			newPost.alias = data.alias;
			newPost.images = data.images;
			newPost.description = data.description;
			newPost.content = data.content;
			if (data.category) {
				newPost.category = data.category;
			}
			newPost.status = data.status;
			newPost.pinPost = data.pinPost;
			newPost.createdBy = req.session.user._id;
			newPost.save(function (err, newPost) {
				if (err) {
					return res.json({
                        success: false,
                        errorCode: '010',
                        message: errors,
                        data: req.body
                    })
				} else {
					return res.json({
                        success: true,
                        errorCode: 0,
                        message: 'Đăng bài viết thành công'
                    });
				}
			})
		}
	});
}

/** Get post details */
exports.getDetail = (req, res, next) => {
	let postId = req.params.postId;

	Post.findById(postId, {
		'_id': 1,
		'title': 1,
		'alias': 1,
		'image': 1,
		'imageUrl': 1,
		'description': 1,
		'content': 1,
		'category': 1,
		'comments': 1,
		'tags': 1,
		'seo': 1,
		'createdAt': 1
	})
	.populate({
		path: 'comments',
		model: 'Comment',
		populate: {
			path: 'createdBy',
			model: 'User',
			select: { '_id': 0, 'userName': 1 }
		}
	})
	.exec(function (err, post) {
		if (err) {
			console.log('err', err)
			return res.json({
				success: false,
				errorCode: '121',
				message: 'Lỗi không xác định'
			})
		}
		res.send({
			success: true,
			errorCode: 0,
			data: post,
			message: 'Get post detail successfully'
		});
	});
}