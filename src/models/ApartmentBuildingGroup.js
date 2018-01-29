const mongoose = require('mongoose');

/**
 * Room  Mongo DB model
 * @name apartmentBuildingGroupModel
 */
const apartmentBuildingGroupSchema = new mongoose.Schema({
    abgName: { type: String, required: true, unique: true },
    apartmentBuildings: [{type: mongoose.Schema.Types.ObjectId, ref: 'ApartmentBuilding'}],
    district: {type: mongoose.Schema.Types.ObjectId, ref: 'District'},
    province: {type: mongoose.Schema.Types.ObjectId, ref: 'Province'},
    address: {type: String},
    manager: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updatedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    status: { type: Number }, // active, inActive
}, {timestamps: true, usePushEach: true});

const ApartmentBuildingGroup = mongoose.model('ApartmentBuildingGroup', apartmentBuildingGroupSchema);

module.exports = ApartmentBuildingGroup;