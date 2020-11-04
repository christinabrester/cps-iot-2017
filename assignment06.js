var http = require("http").createServer(handler);
var io = require("socket.io").listen(http); //socket library
var fs = require("fs"); // variable for file system
var firmata = require("firmata");

var board = new firmata.Board("/dev/ttyACM0", function(){ // ACM Abstract Control Model for serial communication with Arduino (could be USB)
    console.log("Connecting to Arduino");
    console.log("Enabling analog Pin 0");
    board.pinMode(0, board.MODES.ANALOG); // analog pin 0
    console.log("Enabling analog Pin 1");
    board.pinMode(1, board.MODES.ANALOG); // analog pin 1
    
    console.log("Activation of Pin 2");
    board.pinMode(2, board.MODES.OUTPUT); // pin13 as out
    
    console.log("Activation of Pin 8");
    board.pinMode(8, board.MODES.OUTPUT); // pin13 as out
    
    console.log("Activation of Pin 13");
    board.pinMode(13, board.MODES.OUTPUT); // pin13 as out
});


function handler(req, res) {
    fs.readFile(__dirname + "/assignment06.html",
    function (err, data) {
        if (err) {
            res.writeHead(500, {"Content-Type": "text/plain"});
            return res.end("Error loading html page.");
        }
    res.writeHead(200);
    res.end(data);
    })
}


var desiredValue = 0; // desired value var
var actualValue = 0; 

http.listen(8080); // server will listen on port 8080


board.on("ready", function() {
    board.analogRead(0, function(value){
        desiredValue = value; // continuous read of analog pin 0
    });
    
    board.analogRead(1, function(value) {
        actualValue = value; // continuous read of pin A1
    });
    
    io.sockets.on("connection", function(socket) {
        socket.emit("messageToClient", "Server connected, board ready.");
        
        setInterval(sendValues, 40, socket); // na 40ms we send message to client

    
    }); //end of sockets.on connection
    
}); // end of board.on ready


function sendValues (socket) {
    socket.emit("clientReadValues",
    {
    "desiredValue": desiredValue,
    "actualValue": actualValue
    });
    
    if (actualValue == desiredValue) {
            board.digitalWrite(13, board.HIGH); board.digitalWrite(8, board.LOW); board.digitalWrite(2, board.LOW); 
        }
    if (actualValue < desiredValue) {
            board.digitalWrite(8, board.HIGH); board.digitalWrite(13, board.LOW); board.digitalWrite(2, board.LOW); 
        }
    if (actualValue > desiredValue) {
            board.digitalWrite(2, board.HIGH); board.digitalWrite(13, board.LOW); board.digitalWrite(8, board.LOW); 
        }
};