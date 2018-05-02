const mongoose = require('mongoose');

/**
 * Utility Category Mongo DB model
 * @name serviceCategoryModel
 */
const utilityCategorySchema = new mongoose.Schema({
    name: { type: String },
    icon: {type: String},
    orderDisplay: {type: Number},
    status: { type: Number }, // active, inActive
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updatedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
}, {timestamps: true, usePushEach: true});

utilityCategorySchema.set('toJSON', {
    virtuals: true
});

// Get full image url with media config
utilityCategorySchema.virtual('iconUrl').get(function () {
    return process.env.MEDIA_URL + '/images/utility/origin/' + this.icon;
});

const UtilityCategory = mongoose.model('UtilityCategory', utilityCategorySchema);

module.exports = UtilityCategory;