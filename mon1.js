var fs     = require('fs');
var Docker = require('dockerode');

var socket = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
var stats  = fs.statSync(socket);

if (!stats.isSocket()) {
	throw new Error('Are you sure the docker is running?');
}

var docker = new Docker({socketPath: socket});

docker.listContainers({all: true}, function(err, containers) {
	console.log('ALL: ' + containers.length);
	console.log(containers);
});