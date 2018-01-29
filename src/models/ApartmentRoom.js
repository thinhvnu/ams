const mongoose = require('mongoose');

/**
 * Room  Mongo DB model
 * @name apartmentRoomModel
 */
const apartmentRoomModel = new mongoose.Schema({
    roomName: { type: String},
    area: {type: Number},
    apartment: {type: mongoose.Schema.Types.ObjectId, ref: 'Apartment'},
    status: { type: Number }, // active, inActive
}, {timestamps: true, usePushEach: true});

const ApartmentRoom = mongoose.model('ApartmentRoom', apartmentRoomModel);

module.exports = ApartmentRoom;