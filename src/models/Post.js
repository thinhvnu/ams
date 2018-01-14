var mongoose = require('mongoose');

/**
 * Posts  Mongo DB model
 * @name postModel
 */
const postSchema = new mongoose.Schema({
    title: {type: String},
    alias: {type: String},
    images: {type: String},
    description: {type: String},
    content: {type: String},
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    publishTime: {type: Date},
    seo: {
        metaTitle: {type: String},
        metaDesc: {type: String},
        metaKeyWords: {type: String}
    },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    pinPost: {type: Boolean},
    views: {type: Number},
    status: {type: Boolean},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
}, {timestamps: true});

postSchema.set('toJSON', {
    virtuals: true
});
// Get full image url with media config
postSchema.virtual('imageUrl').get(function () {
    return process.env.MEDIA_URL + '/images/post/' + this.image;
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;