/*
 * grunt-connect
 * https://github.com/iammerrick/grunt-connect
 *
 * Copyright (c) 2012 Merrick Christensen
 * Licensed under the MIT license.
 */
/*jshint es5:true*/

var connect = require('connect');
var path = require('path');
var fs = require('fs');

module.exports = function(grunt) {

  // Please see the grunt documentation for more information regarding task and
  // helper creation: https://github.com/gruntjs/grunt/blob/master/docs/toc.md

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('connect', 'Run a simple static connect server till you shut it down.', function() {

    var keepAlive = this.data.keepAlive;

    if (keepAlive === undefined || keepAlive === true) {
      this.async();
    }

    var port = this.data.port || 1337;
    var bases = [];

    if (this.data.base !== undefined) {
      bases.push(path.resolve(this.data.base));
    }

    if (this.data.combine !== undefined) {
      this.data.combine.forEach(function (base) {
        bases.push(path.resolve(base));
      });
    }

    // add default if nothing is specified
    if (bases.length === 0) {
      bases.push(path.resolve('.'));
    }

    grunt.log.success('Opening server for ' + bases.join(', ') +
      ' on port ' + port + '.');

    var app = connect();

    bases.forEach(function (base) {
      app.use(connect.static(base));
      app.use(connect.directory(base));
    });

    var serverProtocol = this.data.protocol || 'http';

    if (serverProtocol !== 'http' && serverProtocol !== 'https')
    {
      grunt.fail.warn("'http' and 'https' are the only valid protocol options");
    }

    if (serverProtocol == 'http') {
      app.listen(port);
    }
    else {
      var options = {
        protocol: serverProtocol,
        port: port,
        hostname: 'localhost',
        keepAlive: keepAlive,
        cert:  fs.readFileSync(this.data.cert).toString(),
        key: fs.readFileSync(this.data.key).toString(),
        passphrase: this.data.passphrase,
        ca: fs.readFileSync(this.data.ca).toString()
      };

      require(options.protocol).createServer(options, app)
        .listen(options.port, options.hostname)
        .on('error', function(err) {
          if (err.code === 'EADDRINUSE') {
            grunt.fatal('Port ' + options.port + ' is already in use by another process.');
          } else {
            grunt.fatal(err);
          }
      });
    }
  });
};
