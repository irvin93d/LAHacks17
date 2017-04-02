var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser')
var port = process.env.PORT || 3000;
// TODO make real database
let users = [];
let chatWindowTime = 10 * 1000; // 10 seconds

class Chatroom {
    constructor(){
        this.expire = Date.now() + chatWindowTime;
        this.numberOfClients = 0;
        this.id = "LOL STUPID ROOM";
    }
}

// parse various different custom JSON types as JSON
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// Handle chat clients
io.on('connection', function(socket){ 
    console.log("Client Connected");

	// TODO DONT HARD CODE 
	socket.join('LOL STUDID ROOM');
	// TODO should .to be included?
	socket.broadcast.to('LOL STUDID ROOM').emit('message','Joined room');

	// TODO Store all messages	
	socket.on('message', (msg) => {
		let message = {};
		message.time = Date.now();
		message.user = socket.user;
		message.content = msg;
		console.log(message);
	})

	// TODO only add if user doesn't exist
	socket.on('setup', (user) => {
		console.log('setup');
		socket.user = user;
		console.log('User joined:', socket.user.user);
	})

	// TODO remove user from users. Store username and stuff in socket?
	socket.on('disconnect', () => {
		console.log('Disconnect');
	})
});


// Routing
app.post("/sign-up", (req, res) => {
    let user = req.body;
    console.log(user);
    users.push(user);
    res.status(200).send();
});

app.get("/users", (req, res) => {
    res.send(getUsersInRoom('LOL STUDID ROOM'));
});


server.listen(port, function () {
	console.log('Server listening at port %d', port);
});

function getUsersInRoom(roomid) {
	let users = [];
	let sockets = io.sockets.adapter.rooms[roomid].sockets;
	for(let s in sockets) {
		if(sockets.hasOwnProperty(s)){
			let socket = io.sockets.connected[s];
			users.push(socket.user);
		}
	}
	return users;
}

