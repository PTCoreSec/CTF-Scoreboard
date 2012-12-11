var config = {};

config.db = {};
config.dbHashes = {};

// Complete DB
config.db.host = ''; // <-- Insert host
config.db.user = ''; // <-- Insert user
config.db.password = ''; // <-- Insert password
//Don't Change.
config.db.database = 'torneio';

// Password Salt DB
config.dbHashes.host = ''; // <-- Insert host
config.dbHashes.user = ''; // <-- Insert user
config.dbHashes.password = ''; // <-- Insert password
//Don't Change.
config.dbHashes.database = 'passsalts';

module.exports = config;
