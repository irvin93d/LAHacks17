let serverAddress = 'http://localhost:3000';
let user = {};
var socket = io.connect(serverAddress);
let state = {
    messages: [],
    addMessage: function(m) {
        this.messages.push(m);
    },
    startChat: function() {
        Vue.set(this, chat, true);
        this.chat = true;
        console.log("set chat true")
    }
};




socket.on('disconnect', function() {
	console.log('disconnect fired!');
});
socket.on('reconnect', function() {
	console.log('reconnect fired!');
});



window.onload = () => {

    // Message list 
    Vue.component('message-item', {
        props: ['message', 'me'],
        template: `
            <div class="message-item" v-bind:class="{me: me}">
                <span class="message-item--content">{{message.content}}</span>
                <br>
                <span class="message-item--from">- {{message.user}}</span>
            </div>
        `
    });
    
    // Chat page
    var chat = new Vue({
    el: '#chat',
    data: {
        message: '',
        messages: state.messages,
        noUsers: 0,
        seconds: 0,
        nick: "",
        visible: false,
        requestContact: true,
        users: [],
        roomID: 0,
        checkedNames: []
    },

    methods: {
        send: function() {
            state.addMessage({content: this.message, user: "You"});
            socket.emit('message', this.message);
            this.message = "";
            
            // Apparently vue is asynchronous
            this.$nextTick(()=> {
                var container = this.$el.querySelector(".message-list");                
                window.scrollTo(0, container.scrollHeight);
            })
        },
        request: function() {
            console.log("requesting " + this.checkedNames);
            if(this.checkedNames.length) {
                socket.emit('request contact', {roomID: this.roomID, names: this.checkedNames, me: user.nick});
            }
            this.roomID = 0;
            this.requestContact = false;
            this.checkedNames = [];
        }
    }
    });

    var signIn = new Vue({
        el: '#user-info',
        data: {
            name: "",
            nation: "Afghan",
            profile: "",
            visible: true,
            invalidName: false,
            invalidUrl: false
        },

        methods: {
        send: function() {
            if(this.name.length === 0) {
                this.invalidName = true;
                return;
            } else {
                this.invalidName = false;
            }

            if(this.profile.length === 0) {
                this.invalidUrl = true;
                return;
            } else {
                this.invalidUrl = false;
            }

            user = {name: this.name, nation: this.nation, profile: this.profile};
            socket.emit('setup', user);
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
        console.log(message);
        // Apparently vue is asynchronous
        Vue.nextTick(()=> {
            var container = chat.$el.querySelector(".message-list");                
            window.scrollTo(0, container.scrollHeight);
        })
    });

    socket.on('tick', function(data) {
	    console.log('tick');
        chat.seconds = Math.floor(data.timeToExpire / 1000)
        chat.noUsers = data.noUsers;
    });

    socket.on('room expired', function(data) {
        console.log("Room expired");
        console.log(data);
        state.messages.splice(0,state.messages.length);
        console.log(user);
        chat.users = data.users.filter( (u) => u && u != user.nick);
        chat.seconds = 0;
        chat.noUsers = 0;
        chat.requestContact = true;
        chat.roomID = data.roomID;
    });
    
    socket.on('nickname', function(nick) {
        chat.nick = nick;
        user.nick = nick;
    });
   
}
