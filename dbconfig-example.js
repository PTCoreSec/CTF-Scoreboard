var dbdbconfig = {};

dbdbconfig.db = {};
dbdbconfig.dbHashes = {};

// Complete DB
dbdbconfig.db.host = 'localhost'; // <-- Insert host
dbdbconfig.db.user = 'root'; // <-- Insert user
dbdbconfig.db.password = 'password'; // <-- Insert password
//Don't Change.
dbdbconfig.db.database = 'torneio';

// Password Salt DB
dbdbconfig.dbHashes.host = 'localhost'; // <-- Insert host
dbdbconfig.dbHashes.user = 'root'; // <-- Insert user
dbdbconfig.dbHashes.password = 'password'; // <-- Insert password
//Don't Change.
dbdbconfig.dbHashes.database = 'passsalts';

module.exports = dbdbconfig;
