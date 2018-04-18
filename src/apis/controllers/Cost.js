const Cost = require('../../models/Cost');
const User = require('../../models/User');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

exports.postSubmitData = (req, res, next) => {
    try {
        let data = JSON.parse(req.body.data), count = 0;

        let dataApartments = data[2], dataApartmentsCustom = {};

        for (let i=0; i<dataApartments.length; i++) {
            dataApartmentsCustom[dataApartments[i].ten_can_ho] = dataApartments[i].id;
        }
        
        for (let i=0; i<data[0].length; i++) {
            let newCost = new Cost();
            newCost.costType = data[1][0].id;
            newCost.apartment = dataApartmentsCustom[data[0][i].can_ho];
            newCost.money = data[0][i].so_tien;
            newCost.month = data[0][i].thang;
            newCost.year = data[0][i].nam;
            newCost.status = 0;
            newCost.createdBy = req.session.user._id;
            newCost.save((err, nabg) => {
                count ++;
                if (count >= data[0].length) {
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

exports.getApartmentCost = (req, res, next) => {
    let user = req.session.user;

    User.findById(user._id)
        .populate({
            path: 'apartment',
            model: 'Apartment'
        })
        .exec((err, u) => {
            if (u) {
                let costData = [], count=0;
                Cost.find({
                    apartment: u.apartment ? u.apartment._id : null,
                    year: req.query.year
                })
                .populate({
                    path: 'costType',
                    model: 'CostType'
                }).exec((err, costs) => {
                    let c = [[], [], [], [], [], [], [], [], [], [], [], []];
                    console.log("costs",costs)
                    if(costs && Array.isArray(costs)){
                        for (let j=0; j<costs.length; j++) {
                            if (costs[j].month >= 1 && costs[j].month <= 12) {
                                c[costs[j].month - 1].push(costs[j]);
                            }
                        }
                    }
                        costData[0] = {
                            apartment: u.apartment,
                            costs: c
                        }
                        return res.json({
                            success: true,
                            errorCode: 0,
                            data: costData
                        })
                
                });
                
            } else {
                return res.json({
                    success: false,
                    errorCode: '234',
                    message: 'Error'
                })
            }
        })
}