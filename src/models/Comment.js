const mongoose = require('mongoose');

/**
 * Group  Mongo DB model
 * @name CommentModel
 */
const commentSchema = new mongoose.Schema({
    post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
    content: { type: String },
    status: { type: Number }, // active, deleted
    createdBy: {type: mongoose.Schema.Types.ObjectId},
    updatedBy: {type: mongoose.Schema.Types.ObjectId}
}, {timestamps: true, usePushEach: true});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;