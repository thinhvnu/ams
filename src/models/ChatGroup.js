const mongoose = require('mongoose');

/**
 * Chat Group  Mongo DB model
 * @name roomModel
 */
const chatGroupSchema = new mongoose.Schema({
    groupName: { type: String, unique: true },
    members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    description: {type: String},
    building: {type: mongoose.Schema.Types.ObjectId, ref: 'ApartmentBuilding'},
    buildingGroup: {type: mongoose.Schema.Types.ObjectId, ref: 'ApartmentBuildingGroup'},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updatedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    status: { type: Number }, // active, inActive
}, {timestamps: true, usePushEach: true});

const ChatGroup = mongoose.model('ChatGroup', chatGroupSchema);

module.exports = ChatGroup;