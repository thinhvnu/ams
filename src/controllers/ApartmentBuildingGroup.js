const ApartmentBuildingGroup = require('../models/ApartmentBuildingGroup');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

// Get all apartment building group
exports.getIndex = function (req, res, next) {
    client.get('get_list_abgs', (err, abgs) => {
		if (err) {
			console.log('err', err);
			throw err;
		}
		if (abgs) {
			res.render('apartment-building-group/index', {
                title: 'Danh sách khu chung cư',
                current: ['apartment-building-group', 'index'],
                data: JSON.parse(abgs)
            });
		} else {
            ApartmentBuildingGroup.find()
            .populate('user', {
                '_id': 0,
                'userName': 1
            })
            .exec(function (err, abgs) {
                if (err) {
                    console.log('err', err)
                    return done(err);
                }

                res.render('apartment-building-group/index', {
                    title: 'Danh sách khu chung cư',
                    current: ['apartment-building-group', 'index'],
                    data: abgs
                });

                /**
				 * Set redis cache data
				 */
				client.set('get_list_abgs', JSON.stringify(abgs));
            });
        }
    });
}

exports.getCreateNew = (req, res, next) => {

}

exports.postCreateNew = (req, res, next) => {

}