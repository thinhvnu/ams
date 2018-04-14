const mongoose = require('mongoose');

/**
 * Service  Mongo DB model
 * @name staticPageModel
 */
const staticPageSchema = new mongoose.Schema({
    title: { type: String},
    content: {type: String},
    type: {type: Number}, // 1: condition & term, 2: about us
    status: { type: Number }, // active, inActive
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updatedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
}, {timestamps: true, usePushEach: true});

const StaticPage = mongoose.model('StaticPage', staticPageSchema);

module.exports = StaticPage;