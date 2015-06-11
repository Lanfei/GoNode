module.exports = [{
	host: '_',
	port: 2323,
	root: './html',
	index: 'index.html',

	ssl: {
		enabled: false,
		key: './conf/key.pem',
		cert: './conf/cert.pem'
	},

	gzip: {
		enabled: true,
		min_length: 1024,
		types: ['html', 'css', 'js', 'json', 'xml']
	},

	logs: {
		access: 'logs/access.log',
		error: 'logs/error.log'
	},

	expires: [
		[/\.gif$/, 10]
	],

	routers: [
		['/', '/index.html']
	]
}];