const mongoose = require('mongoose');

/**
 * Room  Mongo DB model
 * @name buildingModel
 */
const apartmentBuildingModel = new mongoose.Schema({
    buildingName: { type: String, unique: true },
    floor: {type: Number},
    area: {type: Number},
    manager: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    apartments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Apartment'}],
    apartmentBuildingGroup: {type: mongoose.Schema.Types.ObjectId, ref: 'ApartmentBuildingGroup'},
    status: { type: Number }, // active, inActive
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updatedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
}, {timestamps: true, usePushEach: true});

const ApartmentBuilding = mongoose.model('ApartmentBuilding', apartmentBuildingModel);

module.exports = ApartmentBuilding;