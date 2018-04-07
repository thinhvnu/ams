const mongoose = require('mongoose');

/**
 * Like  Mongo DB model
 * @name CommentModel
 */
const likeSchema = new mongoose.Schema({
    post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
    action: { type: Number }, // 0: dislike, 1: like
    createdBy: {type: mongoose.Schema.Types.ObjectId},
    updatedBy: {type: mongoose.Schema.Types.ObjectId}
}, {timestamps: true, usePushEach: true});

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;