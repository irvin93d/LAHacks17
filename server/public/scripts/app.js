let serverAddress = 'http://localhost:3000';
var socket = io.connect(serverAddress);
let state = {
    messages: [
            { text: 'Vegetables' },
            { text: 'Cheese' },
            { text: 'Whatever else humans are supposed to eat' }
           ],
    addMessage: function(m) {
        this.messages.push(m);
    }
    };


socket.emit('setup', {user: "Jonathan", country: "Sweden", profile: "www.facebook.com"});

window.onload = () => {

    // Chat input
    var input = new Vue({
    el: '#message-input',
    data: {
        message: ''
    },
    methods: {
        send: function() {
            console.log(this.message);
            state.addMessage({text: this.message});
            socket.emit('message', this.message);
            this.message = "";
        }
    }
    });

    // Message list 
    Vue.component('message-item', {
        props: ['message'],
        template: '<div>{{message.text}}</div>'
    });

    var messageList = new Vue({
        el: '#message-list',
        data: {
            messages: state.messages
        }
    });

    var signIn = new Vue({
        el: '#user-info',
        data: {
            name: "",
            nation: "",
            profile: ""
        },

        methods: {
        send: function() {
            console.log(this.name);
            socket.emit('setup', {user: this.name, nation: this.nation, profile: this.profile});
            this.name = "";
            this.nation = "";
            this.profile= "";

        }
    }
    });

}


