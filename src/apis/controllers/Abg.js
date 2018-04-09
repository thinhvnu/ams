const ApartmentBuildingGroup = require('../../models/ApartmentBuildingGroup');
const ApartmentBuilding = require('../../models/ApartmentBuilding');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

exports.getList = (req, res, next) => {
    ApartmentBuildingGroup.find({}).exec((err, abgs) => {
        if (err) {
            return res.json({
                success: false,
                errorCode: '112',
                data: []
            })
        }
        
        return res.json({
            success: true,
            errorCode: 0,
            data: abgs
        });
    })
}

exports.getListBuilding = function (req, res) {
    ApartmentBuilding.find({apartmentBuildingGroup: req.params.abgId})
        .exec(function (err, abs) {
            if (err) {
                return res.json({
                    success: false,
                    errorCode: '112',
                    data: []
                })
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

exports.postAddNewBuilding = (req, res, next) => {
    try {
        req.checkBody('buildingName', 'Tên tòa nhà không được để trống').notEmpty();
        req.checkBody('abgId', 'Chọn khu chung cư').notEmpty();
        req.checkBody('floor', 'Số tầng của tòa nhà').notEmpty();
        req.checkBody('manager', 'Chọn quản lý').notEmpty();
        
        req.getValidationResult().then(function (errors) {
            if (!errors.isEmpty()) {
                var errors = errors.mapped();

                return res.json({
                    success: false,
                    errors: errors,
                    data: req.body
                });
            } else {
                const apartmentBuilding = new ApartmentBuilding();
                apartmentBuilding.buildingName = req.body.buildingName;
                apartmentBuilding.apartmentBuildingGroup = req.body.abgId;
                apartmentBuilding.floor = req.body.floor;
                apartmentBuilding.area = req.body.area;
                apartmentBuilding.manager = req.body.manager;
                apartmentBuilding.status = req.body.status;
                apartmentBuilding.createdBy = req.session.user._id;
                // apartmentBuilding.updatedBy = req.session.user._id;

                apartmentBuilding.save((err, ab) => {
                    if (err) {
                        console.log('error create new abg', err);
                        return next(err);
                    }
                    /**
                     * Save to apartment building group
                     */
                    ApartmentBuildingGroup.findById(req.body.abgId, (err, abg) => {
                        if (abg) {
                            abg.apartmentBuildings.pull(ab._id);
                            abg.apartmentBuildings.push(ab._id);
                            abg.save();
                        }
                        req.flash('success', 'Thêm tòa nhà thành công');
                        return res.json({
                            success: true,
                            errorCode: 0,
                            message: 'Successfully'
                        })
                    })
                });
            }
        });
    } catch (e) {

    }
}