const mongoose = require('mongoose');

/**
 * Room  Mongo DB model
 * @name apartmentModel
 */
const apartmentModel = new mongoose.Schema({
    apartmentName: { type: String, unique: true },
    area: {type: Number},
    manager: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    apartmentRooms: [{type: mongoose.Schema.Types.ObjectId, ref: 'ApartmentRoom'}],
    building: {type: mongoose.Schema.Types.ObjectId, ref: 'Building'},
    status: { type: Number }, // active, inActive
}, {timestamps: true, usePushEach: true});

const Apartment = mongoose.model('Apartment', apartmentModel);

module.exports = Apartment;