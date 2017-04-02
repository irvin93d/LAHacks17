let serverAddress = 'http://localhost:3000';
var socket = io.connect(serverAddress);
let state = {
    messages: [
            {content: "hellasssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssu", user: "duane"},
            {content: "hellasssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssu", user: "duane"},
            {content: "hellasssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssu", user: "duane"},
            {content: "hellasssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssu", user: "duane"},
            {content: "hellasssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssu", user: "duane"},
            {content: "hellasssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssu", user: "duane"},
            {content: "fuk u", user: "jonathan"},
           ],
    addMessage: function(m) {
        this.messages.push(m);
    },
    startChat: function() {
        Vue.set(this, chat, true);
        this.chat = true;
        console.log("set chat true")
    }
};


window.onload = () => {

    // Message list 
    Vue.component('message-item', {
        props: ['message'],
        template: `
            <div class="message-item">
                <span class="message-item--content">{{message.content}}</span>
                <br>
                <span class="message-item--from">-{{message.user}}</span>
            </div>
        `
    });
    
    // Chat page
    var chat = new Vue({
    el: '#chat',
    data: {
        message: '',
        messages: state.messages,
        visible: false
    },

    methods: {
        send: function() {
            console.log(this.message);
            state.addMessage({content: this.message, user: "you"});
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
            visible: true
        },

        methods: {
        send: function() {
            console.log("Signed in");
            socket.emit('setup', {user: this.name, nation: this.nation, profile: this.profile});
            this.name = "";
            this.nation = "";
            this.profile= "";
            this.visible = false;
            chat.visible = true;
            }
        }
    });

    socket.on('message', function(message) {
        state.messages.push(message);
        console.log(message.content);
    });


}


