const Slider = require('../../models/Slider');
var redis = require('redis');
var client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

// Get all active sliders
exports.getHomeSlider = function (req, res) {
	client.get('homeSliders', (err, sliders) => {
		if (err) {
			console.log('err', err);
			throw err;
		}
		if (sliders) {
			return res.json({
				success: true,
				errorCode: 0,
				data: JSON.parse(sliders)
			});
		} else {
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
				
				res.json({
					success: true,
					errorCode: 0,
					data: sliders
				});

				/**
				 * Set redis cache data
				 */
				client.set('homeSliders', JSON.stringify(sliders), 'EX', process.env.REDIS_CACHE_TIME);
			});
		}
	});
};