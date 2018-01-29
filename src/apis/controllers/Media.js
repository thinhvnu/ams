/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.postUploadImage = (req, res, next) => {
	const fs = require('fs'),
	path = require('path'),
	fileType = require('file-type');

	let uploadDir = '/media/images/';

	let imageData = req.body.imageData, imageType = req.body.imageType,
	fileName = 'post-' + Date.now(),
	ext = null;

	uploadDir += imageType ? (imageType + '/') : 'store/';

	/**
	 * Case no image data
	 */
	if (!imageData || !imageType) {
		return res.json({
			success: false,
			errorCode: 100,
			message: 'Image type or Image data empty'
		});
	}

	imageData = imageData.replace(/^data:image\/\w+;base64,/, "");

	if (imageData.charAt(0) == '/') {
		ext = 'jpeg';
	} else if (imageData.charAt(0) == 'R') {
		ext = 'gif';
	} else if (imageData.charAt(0) == 'i') {
		ext = '.png';
	}

	if (!ext) {
		return res.json({
			success: false,
			errorCode: 101,
			message: 'Data is not image'
		});
	}

	fileName = fileName + '.' + ext;

	fs.writeFile(path.join(__dirname, '/../../..' + uploadDir + 'origin/' + fileName), new Buffer(imageData, "base64"), (err) => {
		if (err) {
			console.log(err);
			return res.json({
				success: false,
				errorCode: 102,
				message: 'Image data error'
			});
		} else {
			return res.json({
				success: false,
				errorCode: 0,
				data: {
					imageUrl: process.env.MEDIA_URL + uploadDir + 'origin/' + fileName,
					fileName: fileName
				},
				message: 'Save message successfully'
			})
		}
	});
}