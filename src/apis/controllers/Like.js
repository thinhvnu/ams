const Like = require('./../../models/Like');
const Post = require('./../../models/Post');

exports.postCreateNew = (req, res, next) => {
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
			var newLike = new Like();
            
            newLike.post = data.postId
            newLike.action = data.action; // 0: dislike, 1: like
            newLike.createdBy = req.session.user._id;
            
			newLike.save(function (err, like) {
				if (err) {
					return res.json({
                        success: false,
                        errorCode: '010',
                        message: errors,
                        data: req.body
                    })
				} else {
                    Like.findById(data.postId, (err, post) => {
                        if (err || !post) {
                            return res.json({
                                success: false,
                                errorCode: '121',
                                message: 'Comment failed'
                            });
                        }
                        post.likes.push(like._id);
                        post.save((err, p) => {
                            return res.json({
                                success: true,
                                errorCode: 0,
                                message: 'Comment successfully'
                            });
                        });
                    })
				}
			})
		}
	});
}