const mongoose = require('mongoose');

/**
 * Service  Mongo DB model
 * @name serviceModel
 */
const serviceSchema = new mongoose.Schema({
    serviceName: { type: String, unique: true },
    image: {type: String},
    content: {type: String},
    status: { type: Number }, // active, inActive
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updatedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
}, {timestamps: true, usePushEach: true});

serviceSchema.set('toJSON', {
    virtuals: true
});

// Get full image url with media config
serviceSchema.virtual('imageUrl').get(function () {
    return process.env.MEDIA_URL + '/images/service/thumb/' + this.image;
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;