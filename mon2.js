var docker = require('docker-remote-api')
var request = docker({
	host: '/var/run/docker.sock'
})

request.get('/containers/json', {json:true}, function(err, containers) {
	if (err) throw err
	console.log('containers', containers)
})

request.get('/images/json', function(err, stream) {
	if (err) throw err
	// stream is a raw response stream
})