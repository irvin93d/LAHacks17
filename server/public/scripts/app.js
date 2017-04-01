let serverAddress = 'http://localhost:3000';

var socket = io.connect(serverAddress);
socket.emit('setup', {user: "Jonathan", country: "Sweden", profile: "www.facebook.com"});

window.onload = () => {
    var input = new Vue({
    el: '#message-input',
    data: {
        message: ''
    },
    methods: {
        send: function() {
            console.log(this.message);
            this.message = "";
            socket.emit('message', this.message);
        }
    }
    })
}