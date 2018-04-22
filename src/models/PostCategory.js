const mongoose = require('mongoose');

/**
 * Post Category Mongo DB model
 * @name postCategoryModel
 */
const postCategorySchema = new mongoose.Schema({
    name: { type: String },
    icon: {type: String},
    orderDisplay: {type: Number},
    status: { type: Number }, // active, inActive
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updatedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
}, {timestamps: true, usePushEach: true});

postCategorySchema.set('toJSON', {
    virtuals: true
});

// Get full image url with media config
postCategorySchema.virtual('iconUrl').get(function () {
    return process.env.MEDIA_URL + '/images/post/origin/' + this.icon;
});

const PostCategory = mongoose.model('PostCategory', postCategorySchema);

module.exports = PostCategory;