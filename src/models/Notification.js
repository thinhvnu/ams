const mongoose = require('mongoose');

/**
 * Notification  Mongo DB model
 * @name Model
 */
const notificationSchema = new mongoose.Schema({
    title: {type: String},
    content: {type: String, unique: true},
    apartment: { type: mongoose.Schema.Types.ObjectId },
    building: { type: mongoose.Schema.Types.ObjectId },
    buildingGroup: { type: mongoose.Schema.Types.ObjectId },
    status: {type: Number},
    createdBy: {type: mongoose.Schema.Types.ObjectId},
    updatedBy: {type: mongoose.Schema.Types.ObjectId}
}, {timestamps: true, usePushEach: true});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;