#!/usr/bin/env node

/**
 * Module dependencies.
 */

// config should be imported before importing any other file
import config from '../config/config';
import app from '../app';
var http = require('http');
var https = require('https');
var fs = require('fs');

import mongoose from 'mongoose';

// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

// plugin bluebird promise in mongoose
mongoose.Promise = Promise;

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(config.port || '9229');
app.set('port', port);

// connect to mongo db
const mongoUri = config.mongo.host;
mongoose.connect(mongoUri, { server: { socketOptions: { keepAlive: 1 } } });
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${mongoUri}`);
}).on('connected', () => {
  console.log('Mongodb connected');
});

//print mongoose logs in dev env
if (config.mongooseDebug) {
  mongoose.set('debug', (collectionName: any, method: any, query: any, doc: any) => {
    //debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  });
}

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

// var options = {
//   key: fs.readFileSync('/etc/letsencrypt/live/gdjzj.hzsdgames.com/privkey.pem'),
//   cert: fs.readFileSync('/etc/letsencrypt/live/gdjzj.hzsdgames.com/fullchain.pem')
// };
// var sslServer = https.createServer(options, app);
// sslServer.listen(`8084`);
// sslServer.on('error', onError);
// sslServer.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string) {
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

function onError(error: any) {
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
  console.log('Listening on ' + bind);
}
