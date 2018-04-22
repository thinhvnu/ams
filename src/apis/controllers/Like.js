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
            
            Like.findOne({post:data.postId,createdBy:req.session.user._id}).exec(function(err,result){
                if (err) {
					return res.json({
                        success: false,
                        errorCode: '010',
                        message: err,
                        data: req.body
                    })
                }else if(result){
                    console.log("result",result);
                    result.action = data.action;
                    
                    result.save(function (err, like) {
                        if (err || !like) {
                            return res.json({
                                success: false,
                                errorCode: '010',
                                message: err,
                                data: req.body
                            })
                        } else {

                            Post.findById(data.postId, (err, post) => {
                                // console.log("postId",data.postId);
                                // console.log("post--------------",post);
        
                                if (err || !post) {
                                    return res.json({
                                        success: false,
                                        errorCode: '121',
                                        message: 'update like in post failed'
                                    });
                                }
                                if(data.action === 0){
                                    remove(post.likes,like._id);
                                }else{
                                    post.likes.push(like._id);
                                }
                                
                                post.save((err, p) => {
                                    return res.json({
                                        success: true,
                                        errorCode: 0,
                                        message: 'like-unlike successfully'
                                    });
                                });
                            })
                        
                        }
                    });
                }else{
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
                            Post.findById(data.postId, (err, post) => {
                                // console.log("postId",data.postId);
                                // console.log("post--------------",post);
        
                                if (err || !post) {
                                    return res.json({
                                        success: false,
                                        errorCode: '121',
                                        message: 'update like in post failed'
                                    });
                                }
                                post.likes.push(like._id);
                                post.save((err, p) => {
                                    return res.json({
                                        success: true,
                                        errorCode: 0,
                                        message: 'like-unlike successfully'
                                    });
                                });
                            })
                        }
                    })
                }
            });
			
		}
    });
    
    function remove(arr, what) {
        var found = arr.indexOf(what);
    
        while (found !== -1) {
            arr.splice(found, 1);
            found = arr.indexOf(what);
        }
    }
    
}