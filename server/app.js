'use strict';
var chalk = require('chalk');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// var session = require('express-session');
var debug = require('debug')('wedsite:server');
var http = require('http');
var app = express();


/**
 * Configure app
 */
app.use(logger('dev'));
// app.use(session({
//     // this mandatory configuration ensures that session IDs are not predictable
//     secret: 'galbathomas'
// }));
app.use(cookieParser());
// Parse our POST and PUT bodies.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(function (req, res, next) {
//   if (!req.session.userId) req.session.userId = Math.random();
//   next();
// });

//make static routes for files in public and node_modules
app.use(express.static(path.join(__dirname, '../browser/public')));  
app.use(express.static(path.join(__dirname, '../browser/build')));
app.use(express.static(path.join(__dirname, '../node_modules')));



//static route to index
var pathToIndex = path.join(__dirname, '../browser', 'public', 'views', 'index.html');
app.get('/', function(req, res, next){
  res.sendFile(pathToIndex);
});

//make static routes for other page routes
['/details', '/rsvp', '/story', '/gifts', '/visiting'].forEach(function (route) {
  app.get(route, function (req, res, next) {
  	var pathToRoute = path.join(__dirname, '../browser', 'public', 'views', route +'.html');
    res.sendFile(pathToRoute);
  });
});

// error handlers

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500).send('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500).send('error', {
    message: err.message,
    error: {}
  });
});

/**
 * Get port from environment and store in Express.
 */
var port = normalizePort(process.env.PORT || '1337');
app.set('port', port);

/**
 * Create HTTP server.
 */
var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
	console.log('listening on', bind);
  debug('Listening on ' + bind);
}
