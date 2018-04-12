var mongoose = require('mongoose');

/**
 * Role  Mongo DB model
 * @name sliderModel
 */
const sliderSchema = new mongoose.Schema({
    name: {type: String},
    image: {type: String},
    link: {type: String},
    building: {type: mongoose.Schema.Types.ObjectId, ref: 'ApartmentBuilding'},
    buildingGroup: {type: mongoose.Schema.Types.ObjectId, ref: 'ApartmentBuildingGroup'},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    status: Boolean,
}, {timestamps: true});

sliderSchema.set('toJSON', {
  virtuals: true
});
// Get full image url with media config
sliderSchema.virtual('thumbnail').get(function () {
  return process.env.MEDIA_URL + '/images/slider/thumb/' + this.image;
});

sliderSchema.virtual('original').get(function () {
  return process.env.MEDIA_URL + '/images/slider/origin/' + this.image;
});

sliderSchema.virtual('originalAlt').get(function () {
  return this.name;
});

const Slider = mongoose.model('Slider', sliderSchema);

module.exports = Slider;