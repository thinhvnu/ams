const Post = require('./../../models/Post');

// Get all posts
exports.getIndex = function (req, res) {
	Post.find({status: 1}, {
		'_id': 0,
		'title': 1,
		'alias': 1,
		'image': 1,
		'imageUrl': 1,
		'description': 1,
		'category': 1,
		'tags': 1,
		'seo': 1,
		'publishTime': 1
	})
	.populate('category', {
		'_id': 0,
		'categoryName': 1,
		'alias': 1
	})
	.populate('tags', {
		'_id': 0,
		'tagName': 1,
		'alias': 1
	}).exec(function (err, posts) {
		if (err) {
			console.log('err', err)
			return done(err);
		}
		res.send({
			code: 0,
			data: posts
		});
	});
};

exports.postCreateNew = (req, res, next) => {
    req.checkBody('content', 'Nội dung không được để trống').notEmpty();
	console.log('ttt', req.body);
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

			console.log('data', data);
			
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