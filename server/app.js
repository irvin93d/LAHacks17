var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser')
var port = process.env.PORT || 3000;
// TODO make real database
let users = [];

// parse various different custom JSON types as JSON
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// Handle chat clients
io.on('connection', function(socket){ 
    console.log("Client Connected");
 });

// Routing
app.post("/sign-up", (req, res) => {
    let user = req.body;
    console.log(user);
    users.push(user);
    res.status(200).send();
});

app.get("/users", (req, res) => {
    res.send(JSON.stringify(users));
});


server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

