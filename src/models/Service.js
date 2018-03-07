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

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;