const async = require('async');
const containerStats = require("./lib/containerStats")();
const client = require('prom-client');

const express = require('express');
const expressApp = express();
expressApp.set('etag', false);
expressApp.set('x-powered-by', false);

var docker = require('docker-remote-api')
var request = docker({
	host: '/var/run/docker.sock'
});

expressApp.get('/probes/readiness', function (req, res) {
	console.log("received readiness probe.");
	request.get("/v1.24/version", {json:true}, function(err, version) {
		if (err) {
			res.status(400);
			res.send("error");
			console.log("responded to readiness probe with error.");
		} else {
			res.header("Content-Type", "text/plain");
			res.status(200);
			res.send("Ready");
			console.log("responded to readiness probe with success.");
		}
	});
});

expressApp.get('/probes/liveness', function (req, res) {
	console.log("received liveness probe.");
	request.get("/v1.24/version", {json:true}, function(err, version) {
		if (err) {
			res.status(400);
			res.send("error");
			console.log("responded to liveness probe with error.");
		} else {
			res.header("Content-Type", "text/plain");
			res.status(200);
			res.send("Ready");
			console.log("responded to liveness probe with success.");
		}
	});
});

expressApp.get('/metrics', function (req, res) {
	res.header("Content-Type", "text/plain");
	async.applyEach([containerStats.get], res, function(err) {
		console.log(client.register.metrics());
		res.send(new Buffer(client.register.metrics()));
	});
});

expressApp.listen(80, function () {
	console.log("listening on 80");
});
