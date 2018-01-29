const mongoose = require('mongoose');

/**
 * Service  Mongo DB model
 * @name serviceModel
 */
const serviceSchema = new mongoose.Schema({
    serviceName: { type: String, unique: true },
    image: {type: String},
    description: {type: String},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updatedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    status: { type: Number }, // active, inActive
}, {timestamps: true});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;