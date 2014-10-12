var hash = require('node_hash');
var randomstring = require("randomstring");
var util = require('util');
var mysql = require('mysql');
var validator = require('validator');
var connections = require('../DB/db.js');
var config = require('../config.js');

exports.checkRegistration = function(req, res) {
	var teamName = req.body.teamName;
	var teamPassword = req.body.teamPassword;
	var confirmTeamPassword = req.body.confirmTeamPassword;

	var salt = randomstring.generate(20);
	var password = hash.sha512(teamPassword, salt);

	if((teamPassword == "") || (teamName == "")) {
		res.render("session/register", {message: "Invalid Username/Password", title: config.brand + ' Registration', config: config});
	}

	else if (teamPassword != confirmTeamPassword) {
		res.render("session/register", {message: "Passwords do not match", title: config.brand + ' Registration', username: teamName, config: config});
	}
	else if (!validator.matches(teamPassword, "(?=^.{8,30}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&amp;*()_+}{&quot;&quot;:;'?/&gt;.&lt;,]).*$")) {
		res.render("session/register", {message: "Password doesn't pass complexity requirements", title: config.brand + ' Registration', username: teamName, config:config});
	}
	else if((teamName != "") && (teamPassword != "" )) {
		connections.connection.query('SELECT * FROM teams WHERE ?', {name: teamName}, function(err, result) {
			if (result[0]) {
				res.render('session/register', {title: config.brand + " Registration", message:"Team name already taken"});
			} else {
				connections.connection.query('INSERT INTO teams SET ?', {name: teamName, description: req.body.description, password: password, administrationLevel: 0}, function(err, result) {
					if (err) console.log(err);
					connections.connectionHashes.query('INSERT INTO userHashes SET ?', {idteams: result.insertId, salt: salt}, function(err, result2){
						if(err) console.log(err);
					});
				});
				res.render("session/login", {title: config.brand + ' Login', message: "Registration Successful. Please login.", config: config});
			}
		});
	}
}

exports.register = function(req, res) {
	res.render('session/register', {title: config.brand + ' Registration', config: config});
}
