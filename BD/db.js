//Config
var config = require('../config.js');
var mysql = require('mysql');

var connections = {};

connections.connection = mysql.createConnection({
							host     : config.db.host,
							user     : config.db.user,
							password : config.db.password,
							database : config.db.database,
						});

connections.connectionHashes = mysql.createConnection({
								host     : config.dbHashes.host,
								user     : config.dbHashes.user,
								password : config.dbHashes.password,
								database : config.dbHashes.database,
							});

module.exports = connections;
