const mongoose = require('mongoose');

/**
 * Service Category Mongo DB model
 * @name serviceCategoryModel
 */
const serviceCategorySchema = new mongoose.Schema({
    name: { type: String },
    icon: {type: String},
    orderDisplay: {type: Number},
    status: { type: Number }, // active, inActive
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updatedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
}, {timestamps: true, usePushEach: true});

serviceCategorySchema.set('toJSON', {
    virtuals: true
});

// Get full image url with media config
serviceCategorySchema.virtual('iconUrl').get(function () {
    return process.env.MEDIA_URL + '/images/service/origin/' + this.icon;
});

const ServiceCategory = mongoose.model('ServiceCategory', serviceCategorySchema);

module.exports = ServiceCategory;