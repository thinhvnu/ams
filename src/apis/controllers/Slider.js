const Slider = require('../../models/Slider');
var redis = require('redis');
var client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

// Get all active sliders
exports.getHomeSlider = function (req, res) {
	console.log('get home slider');
	client.get('homeSliders', (err, sliders) => {
		console.log('testttt');
		if (err) {
			console.log('err', err);
			throw err;
		}
		if (sliders) {
			console.log('slider get from cached');
			return res.json({
				success: true,
				errorCode: 0,
				data: JSON.parse(sliders)
			});
		} else {
			console.log('query database');
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
				client.set('homeSliders', JSON.stringify(sliders), 'EX', 86400);
			});
		}
	});
};