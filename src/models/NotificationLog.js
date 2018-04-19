const mongoose = require('mongoose');

/**
 * Notification  Mongo DB model
 * @name Model
 */
const notificationLogSchema = new mongoose.Schema({
    notification: { type: mongoose.Schema.Types.ObjectId },
    sendTo: { type: mongoose.Schema.Types.ObjectId },
    device: { type: String },
    apartment: { type: mongoose.Schema.Types.ObjectId },
    building: { type: mongoose.Schema.Types.ObjectId },
    buildingGroup: { type: mongoose.Schema.Types.ObjectId },
    isFirst: {type: Boolean, default: false},
    status: { type: Number } // 1: sent, 2: seen
}, {timestamps: true, usePushEach: true});

const NotificationLog = mongoose.model('NotificationLog', notificationLogSchema);

module.exports = NotificationLog;