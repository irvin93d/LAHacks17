var express = require('express');
var animals = require('animals');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser')
var port = process.env.PORT || 3000;
// TODO make real database
let chatWindowTime = 10 * 60 * 1000; // TODO set to 10 seconds
let maxClientsPerRoom = 4;
let chatrooms = [];
let expiredChatrooms = {};
let nextRoomId = 0;

class Chatroom {
	constructor() {
		this.id = nextRoomId++;
		this.expire = Date.now() + chatWindowTime;
		this.numberOfClients = 0;
		this.users = [];
	}
}

// parse various different custom JSON types as JSON
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// Handle chat clients
io.on('connection', function(socket){ 

    console.log('Client Connected');
	// TODO Store all messages	
	socket.on('message', (msg) => {
		let message = {};
		message.time = Date.now();
		message.user = socket.user.nick;
		message.content = msg;
		socket.broadcast.to(socket.roomid).emit('message', message);
		console.log(message);
	})

	socket.on('setup', (user) => {
		socket.user = user;
		socket.user.socketID = socket.id; 
		assignNewRoom(socket);	
	})

	socket.on('request contact', (data) => {
		if(!expiredChatrooms[data.roomID]) {
			return;
		}
		let cr = expiredChatrooms[data.roomID];
		for(req of data.names) {
			let key = [data.me, req].sort().join(',');
			if(cr.matches[key]) {
				// match
				let thi;
				let oth;
				for(let i = 0 ; i < cr.users.length ; ++i){
					if(data.me === cr.users[i].nick){
						thi = cr.users[i];
					} else if(req === cr.users[i].nick) {
						oth = cr.users[i];
					} 
				}
				console.log(thi);
				console.log(oth);
				io.to(thi.socketID).emit('match', oth);
				io.to(oth.socketID).emit('match', thi);
			} else {
				cr.matches[key] = true;
			}
		}
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
	let room = io.sockets.adapter.rooms[roomid];
	if(room){
		let sockets = room.sockets;
		for(let s in sockets) {
			if(sockets.hasOwnProperty(s)){
				let socket = io.sockets.connected[s];
				users.push(socket.user);
			}
		}
		return users;
	} else {
		return [];
	}
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

// TODO Fix nation, e.g. SE to Swedish 
function setNickname(nation){
	return nation + ' ' + animals();
}

function assignNewRoom(socket){
	room = getAvailableRoom();
	socket.roomid = room.id;
	++room.numberOfClients;
	socket.join(room.id);
	socket.user.nick = setNickname(socket.user.nation);
	console.log('User ', socket.user.nick, 'joined room', room.id);
	socket.broadcast.to(socket.roomID).emit('user joined', socket.user.nick);
	room.users.push(socket.user);
	io.to(socket.id).emit('nickname', socket.user.nick);
}

function destroyExpiredChatrooms(){
	let room;
	for(i = 0 ; i < chatrooms.length ; ++i ){
		room = chatrooms[i];
		if(Date.now() > room.expire) {
			console.log('fuck, kill this:', room.id);
			io.to(room.id).emit('room expired', {
				roomID: room.id,
				users: getUsersInRoom(room.id).map((u) => u.nick)
			});	

			let cr = chatrooms.splice(i,1)[0];
			cr.matches = {};
			expiredChatrooms[cr.id] = JSON.parse(JSON.stringify(cr));
			setTimeout(() => {
				delete expiredChatrooms[cr.id];
			},30000);
			
			let a = io.sockets.adapter.rooms[room.id];
			if(a){
				let sockets = a.sockets;
				for(let s in sockets) {
					if(sockets.hasOwnProperty(s)){
						let socket = io.sockets.connected[s];
						socket.leave(room.id);
						assignNewRoom(socket);	
					}
				}
			}

			--i;
		} else {
			io.to(room.id).emit('tick',	{
				roomID: room.id,
				noUsers: room.numberOfClients,
				timeToExpire: room.expire - Date.now()
			})
		}
	}
}

setInterval(destroyExpiredChatrooms, 500);
