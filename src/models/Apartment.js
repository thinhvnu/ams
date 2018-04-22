const mongoose = require('mongoose');

/**
 * Room  Mongo DB model
 * @name apartmentModel
 */
const apartmentModel = new mongoose.Schema({
    apartmentName: { type: String},
    area: {type: Number},
    manager: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    apartmentRooms: [{type: mongoose.Schema.Types.ObjectId, ref: 'ApartmentRoom'}],
    building: {type: mongoose.Schema.Types.ObjectId, ref: 'ApartmentBuilding'},
    buildingGroup: {type: mongoose.Schema.Types.ObjectId, ref: 'ApartmentBuildingGroup'},
    floor: { type: Number },
    users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    status: { type: Number }, // active, inActive
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
}, {timestamps: true, usePushEach: true});

const Apartment = mongoose.model('Apartment', apartmentModel);

module.exports = Apartment;