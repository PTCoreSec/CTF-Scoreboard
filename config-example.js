var config = {};

config.db = {};
config.dbHashes = {};

// Complete DB
config.db.host = 'localhost'; // <-- Insert host
config.db.user = 'root'; // <-- Insert user
config.db.password = 'password'; // <-- Insert password
//Don't Change.
config.db.database = 'torneio';

// Password Salt DB
config.dbHashes.host = 'localhost'; // <-- Insert host
config.dbHashes.user = 'root'; // <-- Insert user
config.dbHashes.password = 'password'; // <-- Insert password
//Don't Change.
config.dbHashes.database = 'passsalts';

module.exports = config;
