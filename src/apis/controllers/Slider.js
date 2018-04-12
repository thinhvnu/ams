const Slider = require('../../models/Slider');
const User = require('../../models/User');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

// Get all active sliders
exports.getHomeSlider = function (req, res) {
	client.get('home_slides', (err, sliders) => {
		if (err) {
			console.log('err', err);
			throw err;
		}
		if (sliders && process.env.CACHE_ENABLE === 1) {
			return res.json({
				success: true,
				errorCode: 0,
				data: JSON.parse(sliders)
			});
		} else {
			User.findById(req.session.user._id)
			.populate({
				path: 'apartments',
				model: 'Apartment'
			}).exec((err, user) => {
				if (user) {
					let sliderIn = [];
					if (user.apartments && user.apartments.length > 0) {
						for(let i=0; i<user.apartments.length; i++) {
							sliderIn.push(apartments[i].building);
						}
					} else {
						sliderIn = [null];
					}
					Slider.find({
						status: 1,
						building: {
							$in: sliderIn
						}
					}, {
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
						client.set('home_slides', JSON.stringify(sliders), 'EX', process.env.REDIS_CACHE_TIME);
					});
				} else {
					Slider.find({
						status: 1
					}, {
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
						client.set('home_slides', JSON.stringify(sliders), 'EX', process.env.REDIS_CACHE_TIME);
					});
				}
			})
		}
	});
};