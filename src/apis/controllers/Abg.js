const ApartmentBuildingGroup = require('../../models/ApartmentBuildingGroup');
const ApartmentBuilding = require('../../models/ApartmentBuilding');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

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

exports.postSubmitData = (req, res, next) => {
    try {
        let data = JSON.parse(req.body.data), count = 0;
        for (let i=0; i<data.length; i++) {
            let newAbg = new ApartmentBuildingGroup();
            newAbg.abgName = data[i].ten_chung_cu;
            newAbg.address = data[i].dia_chi;
            newAbg.manager = data[i].quan_ly || req.session.user._id;
            newAbg.status = 1;
            newAbg.createdBy = req.session.user._id;
            newAbg.save((err, nabg) => {
                count ++;
                if (count >= data.length) {
                    req.flash('success', 'Nhập liệu thành công');
                    return res.json({
                        success: true,
                        errorCode: 0,
                        message: 'Nhập liệu thành công'
                    })
                }
            });
        }
    } catch(e) {
        console.log('e', e);
        return res.json({
            success: false,
            errorCode: 111,
            message: 'Error'
        })
    }
}