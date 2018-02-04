const mongoose = require('mongoose');

/**
 * Permission  Mongo DB model
 * @name Model
 */
const permissonSchema = new mongoose.Schema({
    permissionName: {type: String},
    accessRouter: {type: String, unique: true},
    description: {type: String},
    status: {type: Number},
    createdBy: {type: mongoose.Schema.Types.ObjectId},
    updatedBy: {type: mongoose.Schema.Types.ObjectId}
}, {timestamps: true, usePushEach: true});

const Permission = mongoose.model('Permisson', permissonSchema);

module.exports = Permission;