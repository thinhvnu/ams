exports.getIndex = function (req, res) {
	res.render('dashboard/index', {
        title: 'Phần mềm quản lý chung cư',
        current: ['dashboard', 'index']
    });
};