var mongoose = require('mongoose');

/**
 * Role  Mongo DB model
 * @name roleModel
 */
const roleSchema = new mongoose.Schema({
    roleName: {type: String},
    roleCode: {type: String},
    description: {type: String},
    type: { type: Number },
    permissions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Permission'}],
    users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    status: Boolean,
}, {timestamps: true, usePushEach: true});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;