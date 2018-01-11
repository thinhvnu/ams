const mongoose = require('mongoose');

/**
 * Room  Mongo DB model
 * @name apartmentBuildingGroupModel
 */
const apartmentBuildingGroupSchema = new mongoose.Schema({
    apartmentBuildingGroupName: { type: String, unique: true },
    apartmentBuildings: [{type: mongoose.Schema.Types.ObjectId, ref: 'ApartmentBuilding'}],
    district: {type: mongoose.Schema.Types.ObjectId, ref: 'District'},
    province: {type: mongoose.Schema.Types.ObjectId, ref: 'Province'},
    address: {type: String},
    manager: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    status: { type: Number }, // active, inActive
}, {timestamps: true});

const ApartmentBuilding = mongoose.model('ZoneApartment', apartmentBuildingGroupSchema);

module.exports = ApartmentBuilding;