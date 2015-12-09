var fs = require('fs');
var url = require('url');
var path = require('path');
var async = require('async');
var error = require('./error');

function App(config) {

	config = config || {};
	var root = config['root'];

	return function (req, res) {
		var urlObj = url.parse(req.url);
		var filename = path.join(root, urlObj.pathname);
		async.waterfall([
			// 处理文件信息
			function (next) {
				if (filename.slice(-1) === '/') {
					filename += 'index.html';
				}
				fs.stat(filename, next);
			},
			// 处理缓存信息
			function (stats, next) {
				if (!stats || !stats.isFile()) {
					next(error.notFound());
					return;
				}
				var lastModified = stats.mtime.toUTCString(),
					cachedModified = req.headers['if-modified-since'];
				if (cachedModified && cachedModified === lastModified) {
					res.statusCode = 304;
					res.end();
				} else {
					res.setHeader('Last-Modified', lastModified);
					next();
				}
			}
		], function (err) {
			// 处理结果
			if (err) {
				res.statusCode = err.statusCode || 503;
				res.end(err.message);
			} else {
				fs.createReadStream(filename).pipe(res);
			}
		});
	}
}

module.exports = App;
