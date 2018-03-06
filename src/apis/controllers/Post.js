const Post = require('./../../models/Post');

// Get all posts
exports.getIndex = function (req, res) {
	Post.find({}, {
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
		'publishTime': 1
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
	.exec(function (err, posts) {
		if (err) {
			console.log('err', err)
			return done(err);
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
	
    var errors = req.getValidationResult().then(function(errors) {
		if (!errors.isEmpty()) {
            return res.json({
                success: false,
                errorCode: 010,
                message: errors,
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
			newPost.category = data.categoryId ? data.categoryId : null;
			newPost.status = data.status;
			newPost.pinPost = data.pinPost;
			newPost.save(function (err, newPost) {
				if (err) {
					return res.json({
                        success: false,
                        errorCode: 010,
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