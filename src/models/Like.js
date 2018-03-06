const mongoose = require('mongoose');

/**
 * Group  Mongo DB model
 * @name likeModel
 */
const likeSchema = new mongoose.Schema({
    post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
    createdBy: {type: mongoose.Schema.Types.ObjectId},
    updatedBy: {type: mongoose.Schema.Types.ObjectId}
}, {timestamps: true, usePushEach: true});

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;