const mongoose = require('mongoose');

/**
 * Group  Mongo DB model
 * @name chatRecentModel
 */
const chatRecentSchema = new mongoose.Schema({
    sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    partner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    group: {type: mongoose.Schema.Types.ObjectId, ref: 'ChatGroup'},
    count: {type: Number, default: 1},
}, {timestamps: true, usePushEach: true});

const ChatRecent = mongoose.model('ChatRecent', chatRecentSchema);

module.exports = ChatRecent;