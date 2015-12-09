exports.notFound = function () {
	var err = new Error('Not Found');
	err.statusCode = 404;
	return err;
};

exports.serverError = function () {
	var err = new Error('Server Error');
	err.statusCode = 503;
	return err;
};