var http = require('http');
var App = require('../');

var server = http.createServer(new App({
	root: __dirname + '/statics'
}));

server.listen(8000);
