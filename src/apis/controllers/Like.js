const Like = require('./../../models/Like');
const Post = require('./../../models/Post');

exports.postCreateNew = (req, res, next) => {
    req.checkBody('postId', 'PostID không được để trống').notEmpty();
	req.checkBody('action', 'Action không được để trống').notEmpty();
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
            console.log("data-postid",data.postId)
            console.log("data-action",data.action)
            
            Like.findOne({post:data.postId,createdBy:req.session.user._id}).exec(function(err,result){
                if (err) {
					return res.json({
                        success: false,
                        errorCode: '010',
                        message: err,
                        data: req.body
                    })
                }else if(result){
                    console.log("like da ton tai voi user",req.session.user._id)
                    console.log("result  like",result);
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
                    console.log("tao like moi",newLike)
                    
                    newLike.save(function (err, like) {
                        if (err) {
                            return res.json({
                                success: false,
                                errorCode: '010',
                                message: errors,
                                data: req.body
                            })
                        } else {
                            console.log("tao like moi thanh cong",like)
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
                                console.log("cap nhat like trong post",post)
                                console.log("them id cua like moi",like._id)
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