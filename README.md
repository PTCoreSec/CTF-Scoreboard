# ptcoresec-scoreboard-ctf
========================

A scoreboard used for CTF jeopardy style events

This is a scoreboard that can be used for jeopardy style tournaments. It was developed by us to be used in our capture the flag security events.

### INSTALLATION (Version 0.1)

You need to have NodeJS, Redis and MySQL installed:

We have tested the scoreboard with Ubuntu 12.04 64 bits, NodeJS versions 0.6.12 and 0.8.1, Redis version 2.2.12 and 2.4.15.

    sudo apt-get update
    sudo apt-get install nodejs redis-server mysql-server

In the folder DB you will find two SQL scripts to import, tournament.sql (Complete database) and salts.sql (Password salts). 

    cd BD
    mysql -u username -p &lt; tournament.sql 
    mysql -u username -p &lt; salts.sql 

Go back to the main folder and copy config-example.js to config.js. Next configure the config.js file to use your MySQL database, it will look like this,

    var config = {};
    
    config.db = {};
    config.dbHashes = {};
    
    // Complete DB
    config.db.host = 'localhost'; // &lt;-- Insert host
    config.db.user = 'root'; // &lt;-- Insert user
    config.db.password = 'password'; // &lt;-- Insert password
    //Don't Change.
    config.db.database = 'torneio';
    
    // Password Salt DB
    config.dbHashes.host = 'localhost'; // &lt;-- Insert host
    config.dbHashes.user = 'root'; // &lt;-- Insert user
    config.dbHashes.password = 'password'; // &lt;-- Insert password
    //Don't Change.
    config.dbHashes.database = 'passsalts';
    
    module.exports = config;

We will now generate keys to be used for HTTPS.
----
You can generate the privatekey.pem and certificate.pem files using the following commands:

    cd keys
    openssl genrsa -out privatekey.pem 1024 
    openssl req -new -key privatekey.pem -out certrequest.csr 
    openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem

Now you just need to run node.

    cd ptcoresec-scoreboard-ctf
    node app.js

You can then browse to https://server-address:3000 and login with username Administrator and password 123456

