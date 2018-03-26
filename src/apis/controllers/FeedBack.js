const FeedBack = require('./../../models/FeedBack');

exports.postCreate = (req, res, next) => {
	try {
        req.checkBody('content', 'Nội dung phản hồi không được để trống').notEmpty();
	
        var errors = req.getValidationResult().then(function(errors) {
            if (!errors.isEmpty()) {
                return res.json({
                    success: false,
                    errorCode: '011',
                    message: errors,
                });
            } else {
                let data = req.body;
                let newFeedBack = new FeedBack();
                
                newFeedBack.title = data.title;
                newFeedBack.content = data.content;
                newFeedBack.image = data.image;
                newFeedBack.status = 0;
                newFeedBack.createdBy = req.session.user._id;
                newFeedBack.save(function (err, feedback) {
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
                            message: 'Gửi phản hồi thành công'
                        });
                    }
                })
            }
        });
    } catch (e) {
        return res.json({
            success: false,
            errorCode: '111',
            message: 'Server exception'
        })
    }
}