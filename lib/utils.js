var fs = require('fs');

exports.forEach = function(object, iterator, thisObj) {
	if (Array.isArray(object)) {
		for (var i = 0, l = object.length; i < l; ++i) {
			if (iterator.call(thisObj, object[i], i, object) === false) {
				break;
			}
		}
	} else if (object instanceof Object) {
		for (var key in object) {
			if (iterator.call(thisObj, object[key], key, object) === false) {
				break;
			}
		}
	} else if (iterator !== undefined) {
		iterator.call(thisObj, object, 0, object);
	}
};

exports.isFile = function(path) {
	return fs.existsSync(path) && fs.statSync(path).isFile();
};

exports.isDir = function(path) {
	return fs.existsSync(path) && fs.statSync(path).isDirectory();
};