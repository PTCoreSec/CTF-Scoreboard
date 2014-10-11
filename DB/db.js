//dbconfig
var dbconfig = require('../dbconfig.js');
var mysql = require('mysql');

var connections = {};

connections.connection = mysql.createConnection({
							host     : dbconfig.db.host,
							user     : dbconfig.db.user,
							password : dbconfig.db.password,
							database : dbconfig.db.database,
						});

connections.connectionHashes = mysql.createConnection({
								host     : dbconfig.dbHashes.host,
								user     : dbconfig.dbHashes.user,
								password : dbconfig.dbHashes.password,
								database : dbconfig.dbHashes.database,
							});

module.exports = connections;
