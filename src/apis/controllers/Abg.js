const ApartmentBuilding = require('../../models/ApartmentBuilding');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

// Get all active sliders
exports.getListBuilding = function (req, res) {
    ApartmentBuilding.find({apartmentBuildingGroup: req.params.abgId})
        .exec(function (err, abs) {
            if (err) {
                return done(err);
            }
            
            return res.json({
                success: true,
                errorCode: 0,
                data: abs
            });
        });
};