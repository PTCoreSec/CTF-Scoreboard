var hash = require('node_hash');
var randomstring = require("randomstring");
var util = require('util');
var mysql = require('mysql');
var connections = require('../BD/db.js');

exports.checkRegistration = function(req, res) {
	var teamName = req.body.teamName;
	var teamPassword = req.body.teamPassword;
	
	var salt = randomstring.generate(20);
	var password = hash.sha512(teamPassword, salt);

	connections.connection.query('SELECT * FROM teams WHERE ?', {name: teamName}, function(err, result) {
		console.log(result);
		if (result[0]) res.render('session/register');
		else {
			connections.connection.query('INSERT INTO teams SET ?', {name: teamName, description: req.body.description, password: password, administrationLevel: 0}, function(err, result) {
				if (err) console.log(err);
				connections.connectionHashes.query('INSERT INTO userHashes SET ?', {idteams: result.insertId, salt: salt}, function(err, result2){
					if(err) console.log(err);
					res.render('session/register');
				});
			});
			res.redirect("/login");
		}
	});
}

exports.register = function(req, res) {
	req.session.path = req.route.path;
	res.render('session/register', {title: 'CyberCTF Register' });
}
