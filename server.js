const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require('body-parser');



app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "./static")));
app.use('./static', express.static(path.join(__dirname, 'public')))

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.render('index');
});
const server = app.listen(8000, function() {
    console.log("listening on port 8000");
});
const io = require('socket.io').listen(server);
const usernames = [];

io.sockets.on('connection', function(socket) {
    console.log("Client/socket is connected!");
    console.log("Client/socket id is: ", socket.id);
    socket.on("new_user", function(data, callback) {
        if (usernames.indexOf(data) != -1) {
            callback(false);
        } else {
            callback(true);
            socket.username = data;
            usernames.push(socket.username);
            updateUsernames();
        }
    })

    function updateUsernames() {
        io.sockets.emit('usernames', usernames);
    }
    socket.on("send_message", function(data) {
        io.sockets.emit('new_message', { msg: data, user: socket.username });
    });
    socket.on("disconnect", function(data) {
        if (!socket.username) {
            return;
        }
        usernames.splice(usernames.indexOf(socket.username), 1);
        updateUsernames()
    })
})