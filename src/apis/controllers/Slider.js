const Slider = require('../../models/Slider');

// Get all active sliders
exports.getHomeSlider = function (req, res) {
	Slider.find({status: 1}, {
		'_id': 0,
		'name': 1,
    'link': 1,
    'image': 1,
		'thumbnail': 1,
		'original': 1,
		'originalAlt': 1,
	}).exec(function (err, sliders) {
		if (err) {
			console.log('err', err)
			return done(err);
		}
		res.send({
            success: true,
			errorCode: 0,
			data: sliders
		});
	});
};