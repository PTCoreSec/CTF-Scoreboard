CTF-Scoreboard
========================

========================

A scoreboard used for CTF jeopardy style events

This is a scoreboard that can be used for jeopardy style tournaments. It was developed by us to be used in our capture the flag security events.

### INSTALLATION (Version 1)

You need to have NodeJS, Redis and MySQL installed:

We have tested the scoreboard with Ubuntu 12.04 64 bits, NodeJS versions 0.6.12 and 0.8.1, Redis version 2.2.12 and 2.4.15.

```
sudo apt-get update
sudo apt-get install nodejs redis-server mysql-server
```

In the folder DB you will find two SQL scripts to import, tournament.sql (Complete database) and salts.sql (Password salts).

```
cd BD
mysql -u username -p < tournament.sql
mysql -u username -p < salts.sql
```

Go back to the main folder and copy dbconfig-example.js to dbconfig.js. Next dbconfigure the dbconfig.js file to use your MySQL database, it will look like this,

```
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
```

Go back to the main folder and copy config-example.js to config.js. Edit the options to suit your needs.

```
var config = {};

config.host = "0.0.0.0";
config.appPort = 3000;
config.brand = "exampleCTF";
config.url = "https://localhost:3000";

module.exports = config;
```

We will now generate keys to be used for HTTPS.
-----------------------------------------------

You can generate the privatekey.pem and certificate.pem files using the following commands:

```
cd keys
openssl genrsa -out privatekey.pem 1024
openssl req -new -key privatekey.pem -out certrequest.csr
openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
```

Now you just need to run node.

```
cd CTF-Scoreboard
node app.js
```

You can then browse to https://server-address:3000 and login with username Administrator and password 123456
