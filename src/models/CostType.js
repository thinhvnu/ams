const mongoose = require('mongoose');

/**
 * Cost type  Mongo DB model
 * @name costTypeModel
 */
const costTypeSchema = new mongoose.Schema({
    name: { type: String },
    icon: { type: String },
    description: {type: String},
    status: { type: Number }, // active, inActive
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updatedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
}, {timestamps: true, usePushEach: true});

costTypeSchema.set('toJSON', {
    virtuals: true
});

// Get full image url with media config
costTypeSchema.virtual('iconUrl').get(function () {
    return process.env.MEDIA_URL + '/images/cost/thumb/' + this.icon;
});

const CostType = mongoose.model('CostType', costTypeSchema);

module.exports = CostType;