const Comment = require('./../../models/Comment');
const Post = require('./../../models/Post');

exports.postCreateNew = (req, res, next) => {
    req.checkBody('content', 'Nội dung bình luận không được để trống').notEmpty();
	console.log('req.body', req.body);
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
			var newComment = new Comment();
            
            newComment.post = data.postId
            newComment.content = data.content;
            newComment.createdBy = req.session.user._id;
            
			newComment.save(function (err, cmt) {
				if (err) {
					return res.json({
                        success: false,
                        errorCode: 010,
                        message: errors,
                        data: req.body
                    })
				} else {
                    Post.findById(data.postId, (err, post) => {
                        if (err || !post) {
                            return res.json({
                                success: false,
                                errorCode: 121,
                                message: 'Comment failed'
                            });
                        }
                        post.comments.push(cmt._id);
                        post.save();
                        return res.json({
                            success: true,
                            errorCode: 0,
                            message: 'Comment successfully'
                        });
                    })
				}
			})
		}
	});
}