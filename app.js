/*
 * Server.js
 * 
 * The main portion of this project. Contains all the defined routes for express,
 * rules for the websockets, and rules for the MQTT broker.
 * 
 * Refer to the portions surrounded by --- for points of interest
 */
var express   = require('express'),
	app       = express();
var pug       = require('pug');
var sockets   = require('socket.io');
var path      = require('path');
var bodyParser = require('body-parser');

var eventData = require('./event-data.json');

var conf      = require(path.join(__dirname, 'config'));
var twilioClient = require('twilio')(
		conf.TWILIO_ACCOUNT_SID,
		conf.TWILIO_AUTH_TOKEN
	);
var threshold = 5;
// var localStorage = require('local-storage');
			
// var server;
// var io;
// -- Setup the application
setupSocket();
setupExpress();
function sendSMS(){
	// twilioClient.sendMessage({
	// 	  from: conf.TWILIO_PHONE_NUMBER,
	// 	  to: process.env.CELL_PHONE_NUMBER,
	// 	  body: "Testing TWILIO SMS API for Broker-Bid-Ask"
	// 	// }, function(err, message) {
	// 	//     if(err) {
	// 	//         console.error(err.message);
	// 	//     }
	// 	});
}

function setupSocket(){
// setup socket
var server = require('http').createServer(app);
var io = sockets(server);

server.listen(conf.PORT, conf.HOST, () => { 
	console.log("Listening on: " + conf.HOST + ":" + conf.PORT);
});


io.on('connection', function(socket){
  socket.on('bid-set', function(msg){
    console.log('message: ' + msg);
    //sendSMS();
    socket.emit('update-bid', msg);

  });
});


}



// Helper functions
function setupExpress() {
	app.set('view engine', 'pug'); // Set express to use pug for rendering HTML

	// Setup the 'public' folder to be statically accessable
	var publicDir = path.join(__dirname, 'public');
	app.use(express.static(publicDir));

	// Setup the paths (Insert any other needed paths here)
	app.use(bodyParser.json()); // support json encoded bodies
	app.use(bodyParser.urlencoded({ extended: true }));
	//var listener = io.listen(server);
	// ------------------------------------------------------------------------
	
	// Home page
	app.get('/', (req, res) => {

		//res.render('index', {results: eventData});
		res.sendFile(__dirname + '/index.html');
	});
	
	app.post('/', (req, res) => {
		console.log("Receving android request");
		var key = Object.keys(req.body)[0];	
		var bo = JSON.parse(key);
	});
	
	app.get('/charts',(req,res)=>{
		res.sendFile(__dirname + '/charts.html');
	});
	// Basic 404 Page
	app.use((req, res, next) => {
		var err = {
			stack: {},
			status: 404,
			message: "Error 404: Page Not Found '" + req.path + "'"
		};

		// Pass the error to the error handler below
		next(err);
	});

	// Error handler
	app.use((err, req, res, next) => {
		console.log("Error found: ", err);
		res.status(err.status || 500);

		res.render('error', {title: 'Error', error: err.message});
	});
	// ------------------------------------------------------------------------

	// Handle killing the server
	process.on('SIGINT', () => {
		internals.stop();
		process.kill(process.pid);
	});
}




