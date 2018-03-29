const mongoose = require('mongoose');

/**
 * Service Request  Mongo DB model
 * @name serviceRequestModel
 */
const serviceRequestSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String },
    images: { type: String },
    description: { type: String },
    note: { type: String },
    orderAt: { type: Date },
    status: { type: Number },
    done:{type:Boolean},
    invoice_imgs:{type:String},
    service: {type: mongoose.Schema.Types.ObjectId, ref: 'Service'},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updatedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
}, {timestamps: true, usePushEach: true});

serviceRequestSchema.set('toJSON', {
    virtuals: true
});

// Get full image url with media config
serviceRequestSchema.virtual('imageUrl').get(function () {
    return process.env.MEDIA_URL + '/images/service/thumb/' + this.image;
});

serviceRequestSchema.virtual('invoice_imgs').get(function () {
    return process.env.MEDIA_URL + '/images/service/thumb/' + this.invoice_imgs;
});

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

module.exports = ServiceRequest;