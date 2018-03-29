const mongoose = require('mongoose');

/**
 * Utility  Mongo DB model
 * @name utilityModel
 */
const utilitySchema = new mongoose.Schema({
    utilityName: { type: String, unique: true, required: true },
    image: {type: String},
    content: {type: String},
    status: { type: Number }, // active, inActive
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updatedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
}, {timestamps: true, usePushEach: true});

utilitySchema.set('toJSON', {
    virtuals: true
});

// Get full image url with media config
utilitySchema.virtual('imageUrl').get(function () {
    return process.env.MEDIA_URL + '/images/utility/thumb/' + this.image;
});

const Utility = mongoose.model('Utility', utilitySchema);

module.exports = Utility;