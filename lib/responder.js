var fs = require('fs');
var url = require('url');
var zlib = require('zlib');
var qs = require('querystring');
var utils = require('./utils');
var mime = require('../conf/mime');

exports.handle = function(request, response, config) {

	var root = config.root || './html',
		urlObj = url.parse(request.url),
		path = root + urlObj.pathname;

	// 如果访问路径是目录
	if (utils.isDir(path)) {
		// 如果不以斜杠结尾，进行一次 301 跳转
		if (path.slice(-1) !== '/') {
			response.writeHeader(301, {
				'Location': 'http://' + host + request.url + '/'
			});
			response.end();
			return;
		}
		// 定位至默认页面
		var indexes = config['index'];
		utils.forEach(indexes, function(index) {
			var filename = path + index;
			if (utils.isFile(filename)) {
				path = filename;
				return false;
			}
		});
	}

	// 如果文件不存在，返回 404
	if (!utils.isFile(path)) {
		response.writeHeader(404);
		response.end('404 Not Found');
		return;
	}

	fs.readFile(path, function(err, data) {
		fs.stat(path, function(err, stats) {

			var headers = request.headers;

			// 是否使用缓存
			var lastModified = stats.mtime.toUTCString(),
				cachedModified = headers['if-modified-since'];
			if (cachedModified && cachedModified === lastModified) {
				response.writeHeader(304);
				response.end();
				return;
			}

			// 过期时间
			utils.forEach(config.expires, function(item) {
				var pattern = item[0],
					maxAge = item[1];
				if (pattern instanceof RegExp && pattern.test(path) || path === pattern) {
					var expires = new Date();
					expires.setTime(expires.getTime() + maxAge * 1000);
					response.setHeader('Expires', expires.toUTCString());
					response.setHeader('Cache-Control', maxAge > 0 ? 'max-age=' + maxAge : 'no-store');
					return false;
				}
			});

			// TODO 断点续传
			var range = headers['range'];
			if (range) {
				var ranges = range.replace('bytes=', '').split('-');
				console.log(ranges);
			}

			var ext = path.split('.').pop();
			response.setHeader('Last-Modified', lastModified);
			response.setHeader('Content-Length', data.length);
			response.setHeader('Content-Type', mime[ext] || mime['*']);

			// 判断是否符合 gzip 启用条件
			var gzip = config.gzip,
				acceptEncoding = headers['accept-encoding'];
			if (!range && gzip && gzip.enabled && gzip.types &&
				/\bgzip\b/.test(acceptEncoding) &&
				data.length >= (gzip.min_length || 0) &&
				gzip.types.indexOf(ext) >= 0) {

				zlib.gzip(data, function(err, data) {
					response.setHeader('Content-Encoding', 'gzip');
					response.setHeader('Content-Length', data.length);
					response.end(data);
				});

			} else {
				response.end(data);
			}
		});
	});
};