let serverAddress = 'http://localhost:3000';
let user = {};
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


socket.on('room expired', function(data) {
    console.log("Room expired");
    console.log(data);
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
        visible: false
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
        }
    }
    });

    var signIn = new Vue({
        el: '#user-info',
        data: {
            name: "",
            nation: "AF",
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
            user.name = "You";
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
}
