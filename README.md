<h1>ptcoresec-scoreboard-ctf</h1>
========================

A scoreboard used for CTF jeopardy style events

This is a scoreboard that can be used for jeopardy style tournaments. It was developed by us to be used in our capture the flag security events.

<h3>INSTALLATION (Version 0.1)</h3>

You need to have NodeJS, Redis and MySQL installed:

We have tested the scoreboard with Ubuntu 12.04 64 bits, NodeJS versions 0.6.12 and 0.8.1, Redis version 2.2.12 and 2.4.15.

<pre>
<code>
sudo apt-get update
sudo apt-get install nodejs redis-server mysql-server
</pre>
</code>

In the folder DB you will find two SQL scripts to import, tournament.sql (Complete database) and salts.sql (Password salts). 
<pre>
<code>
cd BD
mysql -u username -p &lt; tournament.sql 
mysql -u username -p &lt; salts.sql 
</pre>
</code>

Go back to the main folder and configure the config.js file to use your MySQL database, it will look like this,
<pre>
<code>
var config = {};

config.db = {};
config.dbHashes = {};

// Complete DB
config.db.host = ''; // &lt;-- Insert host
config.db.user = ''; // &lt;-- Insert user
config.db.password = ''; // &lt;-- Insert password
//Don't Change.
config.db.database = 'torneio';

// Password Salt DB
config.dbHashes.host = ''; // &lt;-- Insert host
config.dbHashes.user = ''; // &lt;-- Insert user
config.dbHashes.password = ''; // &lt;-- Insert password
//Don't Change.
config.dbHashes.database = 'passsalts';

module.exports = config;
</pre>
</code>

We will now generate keys to be used for HTTPS.
<br>
You can generate the privatekey.pem and certificate.pem files using the following commands:
<pre>
<code>
cd keys
openssl genrsa -out privatekey.pem 1024 
openssl req -new -key privatekey.pem -out certrequest.csr 
openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
</pre>
</code>

Now you just need to run node.
<pre>
<code>
cd ptcoresec-scoreboard-ctf
node app.js
</pre>
</code>


You can then browse to https://server-address:3000 and login with username Administrator and password 123456






