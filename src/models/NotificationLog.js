const mongoose = require('mongoose');

/**
 * Notification  Mongo DB model
 * @name Model
 */
const notificationLogSchema = new mongoose.Schema({
    notification: { type: mongoose.Schema.Types.ObjectId },
    sendTo: { type: mongoose.Schema.Types.ObjectId },
    device: { type: String }
}, {timestamps: true, usePushEach: true});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;