var config = require('../config.js');

exports.requiresLogin = function(req, res, next){
	if(req.session.passport.user){
		req.session.teamId = req.user[0].idteams;
		req.session.user = req.user[0].name;
		req.session.administrationLevel = req.user[0].administrationLevel;
		next();
	} else {
		res.render('session/login', { title: config.brand+ ' Login', config: config });
	}
}

exports.requiresAdminLogin = function(req, res, next){
	if(req.session.passport.user && req.user[0].administrationLevel == 2){
		req.session.teamId = req.user[0].idteams;
		req.session.user = req.user[0].name;
		req.session.administrationLevel = req.user[0].administrationLevel;
		next();
	} else {
		res.render('session/login', { title: config.brand+ ' Login', config: config });
	}
}

exports.login = function(req, res) {
		req.session.path = req.route.path;
		res.render('session/login', { title: config.brand+ ' Login', config: config });
}

exports.logout = function(req, res) {
	req.logOut();
	req.session.administrationLevel = '';
	req.session.user = '';
	req.session.teamId = '';
	res.cookie('teamid', null);
	res.redirect('/');
}
