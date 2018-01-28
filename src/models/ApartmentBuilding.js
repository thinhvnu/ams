const mongoose = require('mongoose');

/**
 * Room  Mongo DB model
 * @name buildingModel
 */
const apartmentBuildingModel = new mongoose.Schema({
    buildingName: { type: String, unique: true },
    area: {type: Number},
    manager: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    apartments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Apartment'}],
    apartmentBuildingGroup: {type: mongoose.Schema.Types.ObjectId, ref: 'ApartmentBuildingGroup'},
    status: { type: Number }, // active, inActive
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updatedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
}, {timestamps: true});

const ApartmentBuilding = mongoose.model('Building', apartmentBuildingModel);

module.exports = ApartmentBuilding;