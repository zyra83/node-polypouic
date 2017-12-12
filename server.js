var fs = require('fs')
var express = require('express')

var http = require('http').createServer(handler).listen(8080);
var io = require('socket.io').listen(http)
var url = require('url')

var users = {};
var usersSocket = {};


function handler(req, res) {

    var page = url.parse(req.url).pathname;
    console.log(page);
    if (page === "/") {
        page = "/index.html"
    }
    fs.readFile(__dirname + '/' + page, function(err, data) {
        res.writeHead(200);
        res.end(data);
    });
}

io.sockets.on('connection', function(socket) {	
    var me = false; // stocke l'utilisateur du socket
    console.log("un utilisateur est connecté au socket");

    // l'utilisateur vient d'arriver, on rempli sa colonne des utilisateurs logués
    for (var k in users) {
        socket.emit('newuser', users[k]);
    }

    /**
     * Je me connecte
     */
    socket.on('login', function(user) {
	
		console.log(socket.handshake.address.address + " -> " + user.username + " connecté")
		if(socket.handshake.address.address === "192.168.0.30"){
			socket.emit('do-pouic', {sound: "tabouche.ogg"});
			return false;
		}
        me = user;
        me.id = user.username.replace("@", "-").replace(".", "-");
        me.sid = socket.id;
        socket.emit('logged'); // informe l'utilisateur qu'il s'est bien connecté
        users[me.id] = me;
        io.sockets.emit('newuser', me); // informe tout le monde
    });


    /**
     * Je quitte le tchat
     */
    socket.on('disconnect', function() { // e natif, dÃ©connexion
        if (!me) { // un utilisateur peut se déconnecter même si il n'est pas logué (logged)
            return false;
        }
        delete users[me.id];
        delete usersSocket[me.id];
        io.sockets.emit('disuser', me); // informe tout le monde
    });

    // socket.emit('news', { hello: 'world' });
    socket.on('polyphonic-pouic', function(data) {
        io.sockets.emit('do-pouic', {sound: data.sound});
    });
    // socket.emit('news', { hello: 'world' });
    socket.on('targeted-pouic', function(data) {
        console.log("targeted pouic vers " + data.sid)
        io.sockets.socket(data.sid).emit('do-pouic', {sound: data.sound});
    });
});