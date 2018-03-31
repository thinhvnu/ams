const mongoose = require('mongoose');

/**
 * Cost  Mongo DB model
 * @name costModel
 */
const costSchema = new mongoose.Schema({
    costType: {type: mongoose.Schema.Types.ObjectId, ref: 'CostType'},
    apartment: {type: mongoose.Schema.Types.ObjectId, ref: 'Apartment'},
    month: { type: Number },
    year: { type: Number},
    datePayment: { type: Date },
    status: { type: Number }, // active, inActive
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updatedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
}, {timestamps: true, usePushEach: true});

const Cost = mongoose.model('Cost', costSchema);

module.exports = Cost;