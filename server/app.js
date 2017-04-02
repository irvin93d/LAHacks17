var express = require('express');
var animals = require('animals');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser')
var port = process.env.PORT || 3000;
// TODO make real database
let chatWindowTime = 10 * 1000; // 10 seconds
let maxClientsPerRoom = 4;
let chatrooms = [];
let expiredChatrooms = [];
let nextRoomId = 0;

class Chatroom {
	constructor() {
		this.id = nextRoomId++;
		this.expire = Date.now() + chatWindowTime;
		this.numberOfClients = 0;
	}
}

// parse various different custom JSON types as JSON
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// Handle chat clients
io.on('connection', function(socket){ 

	let room;

    console.log('Client Connected');
	// TODO Store all messages	
	socket.on('message', (msg) => {
		let message = {};
		message.time = Date.now();
		message.user = socket.user;
		message.content = msg;
		socket.broadcast.to(room.id).emit('message', message);
		console.log(message);
	})

	socket.on('setup', (user) => {
		room = getAvailableRoom();
		++room.numberOfClients;
		socket.join(room.id);
		socket.user = user;
		socket.user.nick = setNickname(user.nation);
		console.log('User ', socket.user.user, 'joined room', room.id);
		socket.broadcast.to(socket.roomID).emit('user joined', user.nick);
	})

	socket.on('disconnect', () => {
		console.log('Disconnect');
	})
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

function getAvailableRoom() {
	
	for (i = 0 ; i < chatrooms.length ; ++i) {
		let chatroom = chatrooms[Math.floor(Math.random() * chatrooms.length)]; 
		if(chatroom.numberOfClients < maxClientsPerRoom && chatroom.expire > chatWindowTime/2) {
			return chatroom;
		}
	}

	let chatroom = new Chatroom();
	chatrooms.push(chatroom);
	
	return chatroom;
}

// TODO 
function setNickname(nation){
	return nation + animals();
}

function destroyExpiredChatrooms(){
	let room;
	for(i = 0 ; i < chatrooms.length ; ++i ){
		room = chatrooms[i];
		if(Date.now() > room.expire) {
			console.log('fuck, kill this:', room.id);
			io.to(room.id).emit('room expired', {
				roomID: room.id,
				users: getUsersInRoom(room.id).map((u) => {
					u.nick;
				})
			});
			//TODO put in temp arra
			chatrooms.splice(i,1);
			--i;
		}
		// TODO else update room time
	}
}

setInterval(destroyExpiredChatrooms, 500);
