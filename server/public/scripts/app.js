let serverAddress = 'http://localhost:3000';
var socket = io.connect(serverAddress);
let state = {
    messages: [
            { text: 'Vegetables' },
            { text: 'Cheese' },
            { text: 'Whatever else humans are supposed to eat' }
           ],
    // chat: false,
    addMessage: function(m) {
        this.messages.push(m);
    },
    startChat: function() {
        this.chat = true;
        console.log("set chat true")
    }
};

window.onload = () => {

    // Message list 
    Vue.component('message-item', {
        props: ['message'],
        template: '<div>{{message.text}}</div>'
    });
    
    // Chat page
    var chat = new Vue({
    el: '#chat',
    data: {
        message: '',
        messages: state.messages,
        visible: state.chat
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

    var signIn = new Vue({
        el: '#user-info',
        data: {
            name: "",
            nation: "",
            profile: "",
            visible: !state.chat
        },

        methods: {
        send: function() {
            console.log(this.name);
            socket.emit('setup', {user: this.name, nation: this.nation, profile: this.profile});
            this.name = "";
            this.nation = "";
            this.profile= "";
            this.visible = false;
            state.startChat();            
            }
        }
    });

}


