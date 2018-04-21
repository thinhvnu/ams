const mongoose = require('mongoose');

/**
 * Service Request  Mongo DB model
 * @name serviceRequestModel
 */
const serviceRequestSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    code: {type: Number},
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
    if (this.images) {
        let imgs = this.images.split(','), urls = '';

        for (let i=0; i<imgs.length; i++) {
            urls += process.env.MEDIA_URL + '/images/service/origin/' + imgs[i] + ',';
        }

        return urls;
    }
    return '';
});

serviceRequestSchema.virtual('invoice_imgs_vitrual').get(function () {
    if (this.invoice_imgs) {
        let imgs = this.invoice_imgs.split(','), urls = '';

        for (let i=0; i<imgs.length; i++) {
            urls += process.env.MEDIA_URL + '/images/service/origin/' + imgs[i] + ',';
        }

        return urls;
    }
    return '';
});

serviceRequestSchema.pre('save', function(next) {
    ServiceRequest.findOne({}).sort('-createdAt').exec((err, sr) => {
        if (!this.code) {
            this.code = (sr && sr.code) ? (sr.code + 1) : 1;
            next();
        }
    })
});

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

module.exports = ServiceRequest;