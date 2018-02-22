var _ = require("lodash");
var async = require('async');

const client = require('prom-client');
const monitor = {
	utilization: {
		cpu: new client.Gauge({
			name: 'deck_watch_cpu_utilization',
			help: 'cpu utilization',
			labelNames: ['containerName']
		}),
		memory: new client.Gauge({
			name: 'deck_watch_memory_utilization',
			help: 'memory utilization',
			labelNames: [ 'containerName' ]
		})
	},
	network: {
		sent: new client.Gauge({name: 'deck_watch_bytes_sent', help: 'bytes sent', labelNames: [ 'containerName' ]}),
		received: new client.Gauge({name: 'deck_watch_bytes_received', help: 'bytes received', labelNames: [ 'containerName' ]}),
		errors: new client.Gauge({name: 'deck_watch_network_errors', help: 'network errors', labelNames: [ 'containerName' ]})
	},
	memory: new client.Gauge({
		name: 'deck_watch_memory',
		help: 'memory usage',
		labelNames: [ 'containerName' ]
	})
};

var docker = require('docker-remote-api')
var request = docker({
	host: '/var/run/docker.sock'
})

const express = require('express');
const app = express();
app.set('etag', false);
app.set('x-powered-by', false);

app.get('/metrics', function (req, res) {
	res.header("Content-Type", "text/plain");
	all(res);
});
app.listen(9143, function () {
	console.log("listening on 9143");
});

function all(res) {
	request.get('/v1.24/containers/json', {json: true}, function (err, containers) {
		if (err) throw err;
		//console.log('containers', containers)
		console.log('container count: ' + containers.length);
		var watch = "mock-ti";
		async.each(containers, function (container, cb) {
			var containerName = null;
			var podName = null;
			if (container.Labels.hasOwnProperty('io.kubernetes.container.name')) {
				containerName = container.Labels['io.kubernetes.container.name'];
				switch (containerName) {
					case "POD":
						podName = container.Labels['io.kubernetes.pod.name'];
						console.log("pod name: " + container.Labels['io.kubernetes.pod.name']);
						if (podName.match(new RegExp(watch))) {
							//console.log(container);
							//getStats(container.Id, podName, cb);
							cb();
						} else {
							cb();
						}
						break;
					default:
						console.log("name: "+container.Labels['io.kubernetes.container.name']);
						if (containerName == watch) {
							//console.log(container);
							getStats(container.Id, containerName, cb);
						} else {
							getStats(container.Id, containerName, cb);
							//cb();
						}
				}
			} else if (container.Labels.hasOwnProperty('component')) {
				console.log("component: " + container.Labels.component);
				cb();
			} else {
				console.log(container);
				cb();
			}
		}, function (err) {
			console.log("done");
			console.log(client.register.metrics());
			res.send(new Buffer(client.register.metrics()));
		});
	})
}

//request.get('/images/json', function(err, stream) {
//	if (err) throw err
//	// stream is a raw response stream
//})

function getStats(id, name, cb) {
	request.get("/v1.24/containers/"+id+"/stats?stream=0", {json:true}, function(err, stats) {
		if (err) throw err;
		console.log("###################################################");
		console.log(name);
		//console.log(stats);
		//console.log(stats.cpu_stats);
		//console.log(stats.precpu_stats);

		var cpudelta = (stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage);
		var predelta = (stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage);
		var cpu = 0;
		if (cpudelta>0 && predelta>0) {cpu = stats.cpu_stats.online_cpus * cpudelta/predelta;}
		monitor.utilization.cpu.set({containerName: name}, cpu);

		monitor.memory.set({containerName: name}, stats.memory_stats.usage);
		monitor.utilization.memory.set({containerName: name}, stats.memory_stats.usage/stats.memory_stats.limit);

		if (stats.hasOwnProperty('networks')) {
			monitor.network.sent.set({containerName: name}, stats.networks.eth0.tx_bytes);
			monitor.network.received.set({containerName: name}, stats.networks.eth0.rx_bytes);
			monitor.network.errors.set({containerName: name}, stats.networks.eth0.tx_errors + stats.networks.eth0.rx_errors);
		}

//		console.log(_.pick(stats, ['cpu_stats', 'memory_stats', "networks"]));
		//console.log(stats);
		cb();
	});
}
