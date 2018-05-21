const fs = require('fs');
const {spawn} = require('child_process');
const kill = require('tree-kill');

app = spawn('node', ['code/main']);
app.stdout.on('data', (data) => {
	console.log(data.toString('utf8', 0, data.length-1));
});
app.stderr.on('data', (data) => {
	console.error(data.toString('utf8', 0, data.length-1));
});
