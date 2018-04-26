const mongoose = require('mongoose');

/**
 * Feedback  Mongo DB model
 * @name feedBackModel
 */
const feedBackSchema = new mongoose.Schema({
    title: { type: String },
    image: {type: String},
    content: {type: String},
    status: { type: Number }, // active, inActive
    flag: { type: Number }, // 1: bao chay
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updatedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
}, {timestamps: true, usePushEach: true});

feedBackSchema.set('toJSON', {
    virtuals: true
});

// Get full image url with media config
feedBackSchema.virtual('imageUrl').get(function () {
    return process.env.MEDIA_URL + '/images/feedback/origin/' + this.image;
});

const FeedBack = mongoose.model('FeedBack', feedBackSchema);

module.exports = FeedBack;