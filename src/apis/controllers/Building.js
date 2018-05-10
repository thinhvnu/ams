const ApartmentBuilding = require('../../models/ApartmentBuilding');
const Apartment = require('../../models/Apartment');
const User = require('../../models/User');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

exports.getListApartment = function (req, res) {
    try {
        Apartment.find({building: req.params.buildingId})
            .exec(function (err, apartments) {
                if (err) {
                    return res.json({
                        success: false,
                        errorCode: '121',
                        message: 'Lỗi không xác định'
                    })
                }
                
                return res.json({
                    success: true,
                    errorCode: 0,
                    data: apartments
                });
            });
    } catch (e) {
        return res.json({
            success: false,
            errorCode: 111,
            message: 'Error'
        })
    }
};

exports.postAddNewApartment = (req, res, next) => {
    try {
        req.checkBody('apartmentName', 'Tên căn hộ không được để trống').notEmpty();
        // req.checkBody('floor', 'Chọn tầng cho căn hộ').notEmpty();
        // req.checkBody('manager', 'Chọn quản lý').notEmpty();
        req.getValidationResult().then(function (errors) {
            if (!errors.isEmpty()) {
                var errors = errors.mapped();

                return res.json({
                    success: false,
                    errors: errors,
                    data: req.body
                });
            } else {
                /**
                 * Save to apartment building group
                 */
                ApartmentBuilding.findById(req.body.buildingId).exec((err, ab) => {
                    try {
                        if (ab) {
                            let apartment = new Apartment();
                            apartment.apartmentName = req.body.apartmentName;
                            apartment.building = ab._id;
                            apartment.floor = req.body.floor;
                            apartment.area = req.body.area;
                            apartment.manager = req.body.manager;
                            if (req.body.manager) {
                                apartment.users.pull(req.body.manager);
                                apartment.users.push(req.body.manager);
                            }
                            apartment.status = req.body.status;
                            apartment.createdBy = req.session.user._id;

                            apartment.save((err, a) => {
                                try {
                                    if (err) {
                                        console.log('error create new abg', err);
                                        return next(err);
                                    }
                                    ab.apartments.pull(a._id);
                                    ab.apartments.push(a._id);
                                    ab.save((err, abResult) => {
                                        try {
                                            if (a.manager) {
                                                User.findById(a.manager).exec((err, u) => {
                                                    if (u) {
                                                        u.apartment = a._id;
                                                        u.building = ab._id;
                                                        u.buildingGroup = ab.apartmentBuildingGroup;
                                                        u.save((err) => {
                                                            req.flash('success', 'Thêm căn hộ thành công');
                                                            return res.json({
                                                                success: true,
                                                                errorCode: 0,
                                                                message: 'Successfully'
                                                            })
                                                        })
                                                    }
                                                });
                                            } else {
                                                req.flash('success', 'Thêm căn hộ thành công');
                                                return res.json({
                                                    success: true,
                                                    errorCode: 0,
                                                    message: 'Successfully'
                                                })
                                            }
                                        } catch (e) {
                                            return res.json({
                                                success: false,
                                                errorCode: 111,
                                                message: 'Error'
                                            })
                                        }
                                    });
                                } catch (e) {
                                    return res.json({
                                        success: false,
                                        errorCode: 111,
                                        message: 'Error'
                                    })
                                }
                            });
                        } else {
                            req.flash('errors', 'Thêm căn hộ không thành công');
                            return res.redirect('/apartment-building/view/' + req.body.buildingId);
                        }
                    } catch (e) {
                        return res.json({
                            success: false,
                            errorCode: 111,
                            message: 'Error'
                        })
                    }
                })
            }
        });
    } catch (e) {
        console.log(e);
    }
}