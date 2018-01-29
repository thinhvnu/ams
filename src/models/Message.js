const mongoose = require('mongoose');

/**
 * Group  Mongo DB model
 * @name messageModel
 */
const messageSchema = new mongoose.Schema({
    sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    recipient: {type: mongoose.Schema.Types.ObjectId},
    messageContent: { type: String },
    status: { type: Number }, // active, deleted
    createdBy: {type: mongoose.Schema.Types.ObjectId},
    updatedBy: {type: mongoose.Schema.Types.ObjectId}
}, {timestamps: true, usePushEach: true});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;