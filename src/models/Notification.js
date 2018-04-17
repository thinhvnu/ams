const mongoose = require('mongoose');

/**
 * Notification  Mongo DB model
 * @name Model
 */
const notificationSchema = new mongoose.Schema({
    title: {type: String},
    description: {type: String},
    content: {type: String},
    apartments: { type: Array },
    buildings: { type: Array },
    buildingGroups: { type: Array },
    recipient: {type: mongoose.Schema.Types.ObjectId, model: 'User'},
    type: {type: Number}, // 1: Admin push to App, 2: user send to admin
    status: {type: Number},
    createdBy: {type: mongoose.Schema.Types.ObjectId},
    updatedBy: {type: mongoose.Schema.Types.ObjectId}
}, {timestamps: true, usePushEach: true});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;