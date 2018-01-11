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
    zoneApartment: {type: mongoose.Schema.Types.ObjectId, ref: 'ZoneApartment'},
    status: { type: Number }, // active, inActive
}, {timestamps: true});

const ApartmentBuilding = mongoose.model('Building', apartmentBuildingModel);

module.exports = ApartmentBuilding;