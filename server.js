const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static content folder
app.use(express.static(path.join(__dirname, 'public')));
const botName = 'ChatBot :)';

// Run on client connection
io.on('connection', socket => {
    console.log('New WS connection...');

    // User joins
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        // Welcome new user
        socket.emit('message', formatMessage(botName, 'Welcome to the Chat!'));

        // Broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat!`));
        
        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })

        // User disconnects
        socket.on('disconnect', () => {
            const user = userLeave(socket.id);

            if(user) {
                io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat!`))
                
                // Send users and room info
                io.to(user.room).emit('roomUsers', {
                    room: user.room,
                    users: getRoomUsers(user.room)
                })
            }
        });
        
        socket.on('chatMessage', (msg) => {
            const user = getCurrentUser(socket.id);

            io.to(user.room).emit('message', formatMessage(user.username, msg, user.color));
        });
    });
    

});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));