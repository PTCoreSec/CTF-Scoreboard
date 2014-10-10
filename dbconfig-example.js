var dbconfig = {};

dbconfig.db = {};
dbconfig.dbHashes = {};

// Complete DB
dbconfig.db.host = 'localhost'; // <-- Insert host
dbconfig.db.user = 'root'; // <-- Insert user
dbconfig.db.password = 'password'; // <-- Insert password
//Don't Change.
dbconfig.db.database = 'torneio';

// Password Salt DB
dbconfig.dbHashes.host = 'localhost'; // <-- Insert host
dbconfig.dbHashes.user = 'root'; // <-- Insert user
dbconfig.dbHashes.password = 'password'; // <-- Insert password
//Don't Change.
dbconfig.dbHashes.database = 'passsalts';

module.exports = dbconfig;
