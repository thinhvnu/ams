const mongoose = require('mongoose');

/**
 * Cost type  Mongo DB model
 * @name costTypeModel
 */
const costTypeSchema = new mongoose.Schema({
    name: { type: String },
    description: {type: String},
    status: { type: Number }, // active, inActive
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updatedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
}, {timestamps: true, usePushEach: true});

const CostType = mongoose.model('CostType', costTypeSchema);

module.exports = CostType;