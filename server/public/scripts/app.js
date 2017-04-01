let serverAddress = 'http://localhost:3000';

var socket = io.connect(serverAddress);

window.onload = () => {
    var input = new Vue({
    el: '#message-input',
    data: {
        message: 'Hello Vue!'
    }
    })
}