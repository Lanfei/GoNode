# node-server

A simple node server.

## Installation

```bash
npm install https://github.com/Lanfei/node-server.git
```

## Usage

```js
var http = require('http');
var App = require('server');

var server = http.createServer(new App({
	root: __dirname + '/statics'
}));

server.listen(8000);
```
