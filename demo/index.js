var http = require('http');
var App = require('../');

const PORT = 8000;

var server = http.createServer(new App({
	root: __dirname + '/statics'
}));

server.listen(PORT, function () {
	console.log('Listening on', PORT);
});
