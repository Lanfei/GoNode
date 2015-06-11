var fs = require('fs');
var http = require('http');
var https = require('https');
var utils = require('./utils');
var responder = require('./responder');
var servers = require('../conf/servers');

var serversBySsl = {};

// 按协议整理服务器
utils.forEach(servers, function(serverConfig) {
	var ssl,
		sslConfig = serverConfig.ssl;
	if (sslConfig && sslConfig.enabled) {
		ssl = sslConfig['key'] + ':' + sslConfig['cert'];
	} else {
		ssl = ':';
	}
	serversBySsl[ssl] = serversBySsl[ssl] || [];
	serversBySsl[ssl].push(serverConfig);
});

// 根据不同的 SSL 配置创建服务器
utils.forEach(serversBySsl, function(servers, ssl) {
	var serversByPort = {};

	// 按端口号整理服务器
	utils.forEach(servers, function(serverConfig) {
		var port = serverConfig.port || 80;
		serversByPort[port] = serversByPort[port] || [];
		serversByPort[port].push(serverConfig);
	});

	// 分别侦听各个端口
	utils.forEach(serversByPort, function(servers, port) {
		var serversByHost = [];

		// 按主机名整理服务器
		utils.forEach(servers, function(serverConfig) {
			var hosts = serverConfig.host || '_';

			utils.forEach(hosts, function(host) {
				serversByHost[host] = serverConfig;
			});
		});

		if (ssl === ':') {
			// HTTP
			serverInstance = http.createServer();
		} else {
			// HTTPS
			var sslConfig = ssl.split(':');
			serverInstance = https.createServer({
				key: fs.readFileSync(sslConfig[0]),
				cert: fs.readFileSync(sslConfig[1])
			});
		}
		// 创建服务器
		serverInstance.on('request', function(request, response) {
			var host = request.headers['host'],
				hostname = host.split(':')[0],
				serverConfig = serversByHost[hostname] || serversByHost['_'] || {};

			responder.handle(request, response, serverConfig);

		}).on('error', function(e) {
			console.error(e);
		}).listen(port);
	});
});