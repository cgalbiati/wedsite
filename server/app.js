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
var sequelize = require('sequelize');
var mustacheExpress = require('mustache-express');

var seq = require('./models').seq;
var Guest = require('./models').Guest;

/** 
  * Everything is in this file because I'm lazy and it's a very small project that will not grow bigger 
**/


// // Register '.mustache' extension with The Mustache Express
// app.engine('mustache', mustacheExpress());
// app.set('view engine', 'mustache');
// app.set('views', path.join(__dirname, '../browser/templates'));

/**
 * Configure app
 */
app.use(logger('dev'));
app.use(cookieParser());
// Parse our POST and PUT bodies.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//make static routes for files in public and node_modules
app.use(express.static(path.join(__dirname, '../browser/public')));  
app.use(express.static(path.join(__dirname, '../browser/build')));
app.use(express.static(path.join(__dirname, '../browser/js')));
app.use(express.static(path.join(__dirname, '../node_modules')));


//static route to index
var pathToIndex = path.join(__dirname, '../browser', 'public', 'views', 'index.html');
app.get('/', function(req, res, next){
  res.sendFile(pathToIndex);
});

//make static routes for other page routes
['/details', '/rsvp', '/story', '/gifts', '/visiting', '/rsvpForm'].forEach(function (route) {
  app.get(route, function (req, res, next) {
  	var pathToRoute = path.join(__dirname, '../browser', 'public', 'views', route + '.html');
    res.sendFile(pathToRoute);
  });
});

//static route for rsvp form
app.get('/rsvp/form/:code', function (req, res, next) {
  return res.sendFile(path.join(__dirname, '../browser', 'public', 'views', 'rsvpForm.html'));
});

//api routes
app.get('/api/guest/:code', function(req, res, next){
  return Guest.findAll({
    where: {
      code: req.params.code
    },
    attributes: ['id', 'name', 'status', 'diet']
  }).then(function(guests){
    if (guests) {
      return res.status(200).send(guests);
    }
    return res.send(404)
  }).catch(function(err){
    return next(err);
  });
});

app.post('/api/code', function(req, res, next){
  //validate?
  return res.redirect('/rsvp/form/'+ req.body.code);
});

app.post('/api/rsvp', function (req, res, next) {
  var guests = req.body.guests;
  var updatedGuestPromises = guests.map(function(guest){
    return Guest.findOne({
      where: {
        id: guest.id
      }
    })
    .then(function(foundGuest){
      console.log('found', foundGuest)
      if (foundGuest) { // if the record exists in the db
        foundGuest.updateAttributes({
          status: guest.status,
          diet: guest.diet
        }).then(function(val) {
          return 202;
        });
      }
      else {
        return new Error('user not found'); 
      }
    });
  });
  Promise.all(updatedGuestPromises)
  .then(function(successes){
    return res.send(202);
  })
  .catch(function(err){
    console.log('err', err.message)
    return next(err);
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

//connect to db and start server
//one of the seq.sync statements should always be commented out.  The first resets the db, and the second does not
// seq.sync({force:true})
seq.sync()
.then(function(){
    /**
   * Listen on provided port, on all network interfaces.
   */
  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);

});


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
