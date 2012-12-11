var hash = require('node_hash');
var randomstring = require("randomstring");
var util = require('util');
var mysql = require('mysql');
var connections = require('../BD/db.js');



connections.connection.on('close', function(err) {
  if (err) {
    // We did not expect this connection to terminate
	util.log('ligacao caiu mas vou restabelecer');
    connections.connection = mysql.createConnection(connections.connection.config);
  } else {
    // We expected this to happen, end() was called.
  }
});

connections.connectionHashes.on('close', function(err) {
  if (err) {
    // We did not expect this connection to terminate
	util.log('ligacao caiu mas vou restabelecer');
    connections.connectionHashes = mysql.createConnection(connections.connectionHashes.config);
  } else {
    // We expected this to happen, end() was called.
  }
});

connections.connection.on('error', function(err) {
  util.log(err.code); // 'ER_BAD_DB_ERROR'
  	util.log('ligacao caiu mas vou restabelecer');
    connections.connection = mysql.createConnection(connections.connection.config);
});

connections.connectionHashes.on('error', function(err) {
  util.log(err.code); // 'ER_BAD_DB_ERROR'
  	util.log('ligacao caiu mas vou restabelecer');
    connections.connectionHashes = mysql.createConnection(connections.connectionHashes.config);
});




exports.dashTemplate = function(req, res) {
	res.render('admin/dashboard');
}

exports.addTeam = function(req, res) {
	res.render('admin/insert/addTeam');
}

exports.insertTeam = function(req, res) {
	var teamName = req.body.teamName;
	var teamPassword = req.body.teamPassword;
	var type = req.body.type;
	
	var salt = randomstring.generate(20);
	var password = hash.sha512(teamPassword, salt);

	connections.connection.query('INSERT INTO teams SET ?', {name: teamName, description: req.body.description, password: password, administrationLevel: type}, function(err, result) {
		if (err) console.log(err);
		connections.connectionHashes.query('INSERT INTO userHashes SET ?', {idteams: result.insertId, salt: salt}, function(err, result2){
			if(err) console.log(err);
			res.render('admin/insert/addTeam');
		});
	});
}

exports.listTeams = function(req, res) {
	connections.connection.query('Select * from teams', function(err, result){
		if(err) console.log(err);
		res.render('admin/list/listTeams', {teams: result});
	});
}

exports.showEditTeam = function(req, res) {
	var sqlQuery = 'SELECT * FROM teams WHERE idteams = ' + connections.connection.escape(req.params.id);
	
	connections.connection.query(sqlQuery, function(err, result) {
		if(err) console.log(err);
		
		res.render('admin/edit/editTeam', {team: result[0]});
	 });
}

exports.editTeam = function(req, res) {
	var sqlUpdate = 'UPDATE teams tm SET tm.name = ' + connections.connection.escape(req.body.teamName) + ', tm.description = ' + connections.connection.escape(req.body.description) + ' WHERE tm.idteams = ' + connections.connection.escape(req.params.id);
	
	connections.connection.query(sqlUpdate, function(err, result) {
		if(err) console.log(err);
		
		res.redirect('/editTeam/'+req.params.id);
	});
}

exports.deleteTeam = function(req, res) {
	var sqlDeleteTeam = 'DELETE FROM teams WHERE idteams = ' + connections.connection.escape(req.params.id);
	var sqlDeleteTeamLog = 'DELETE FROM teams_log WHERE idteams = ' + connections.connection.escape(req.params.id);
	
	connections.connection.query(sqlDeleteTeamLog, function(err, result) {
		if (err) console.log(err);
		
		connections.connection.query(sqlDeleteTeam, function(err, result) {
			if (err) console.log(err);
			
			res.redirect('/listTeams');
		});
	});
}

exports.addChallenge = function(req, res) {
	res.render('admin/insert/addChallenge');
}

exports.addCategory = function(req, res) {
	res.render('admin/insert/addCategory');
}

exports.insertCategory = function(req, res) {
	connections.connection.query('INSERT INTO torneio.grupos_problemas SET ?', {name: req.body.categoryName, desc: req.body.description}, function(err, result) {
		if (err) console.log(err);
		
		res.render('admin/insert/addCategory');
	});
}

exports.showEditCategory = function(req, res) {
	var sqlQuery = 'SELECT * FROM grupos_problemas WHERE idgrupos_problemas = ' + connections.connection.escape(req.params.id);
	
	connections.connection.query(sqlQuery, function(err, result) {
		if (err) console.log(err);
		
		res.render('admin/edit/editCategory', {category: result[0]});
	});
}

exports.editCategory = function(req, res) {
	var sqlUpdate = 'UPDATE grupos_problemas gp SET gp.name = ' + connections.connection.escape(req.body.categoryName) + ', gp.desc = ' + connections.connection.escape(req.body.description) + ' WHERE gp.idgrupos_problemas = ' + connections.connection.escape(req.params.id);
	//console.log(sqlUpdate);
	connections.connection.query(sqlUpdate, function(err, result) {
		if (err) console.log(err);
		
		//console.log(result);
		res.redirect('/editCategory/'+req.params.id);
	});
}

exports.listCategories = function(req, res) {
	connections.connection.query('select * from grupos_problemas order by idgrupos_problemas', function(err, result){
		if(err) console.log(err);
		//console.log(result);
		res.render('admin/list/listCategories', {categories: result});
	});

}

exports.deleteCategory = function(req, res) {
	var sqlDeleteCategory = 'DELETE FROM grupos_problemas WHERE idgrupos_problemas = ' + connections.connection.escape(req.params.id);
	var sqlDeleteCategoryProblems = 'DELETE FROM problemas WHERE idgrupos_problemas = ' + connections.connection.escape(req.params.id);
	
	connections.connection.query(sqlDeleteCategoryProblems, function(err, result) {
		if (err) console.log(err);
		
		//console.log(result);
		
		connections.connection.query(sqlDeleteCategory, function(err, result) {
			if (err) console.log(err);
			
			//console.log(result);
			
			res.redirect('/listCategories');
		});
	});
}


exports.addProblem = function(req, res) {
	connections.connection.query('select * from grupos_problemas', function(err, result){
		if(err) console.log(err);
		res.render('admin/insert/addProblem', {categories: result});
	});
}

exports.insertProblem = function(req, res) {
	//console.log(req.body.category);
	
	connections.connection.query('INSERT INTO problemas SET ?', {idgrupos_problemas: req.body.category, resposta: req.body.answer, description: req.body.description, points: req.body.points, level: req.body.level}, function(err, result) {
		if(err) console.log(err);
		
		connections.connection.query('select * from grupos_problemas', function(err, result){
			if(err) console.log(err);
			res.render('admin/insert/addProblem', {categories: result});
		});
	});
}

exports.showEditProblem = function(req, res) {
	var sqlQuery = 'SELECT * FROM problemas WHERE idproblemas = ' + connections.connection.escape(req.params.id);
	var problema;
	var categorias;
	
	//console.log(sqlQuery);
	connections.connection.query(sqlQuery, function(err, result) {
		if (err) console.log(err);
		problema = result[0];
		connections.connection.query('select * from grupos_problemas order by idgrupos_problemas', function(err, result){
			if(err) console.log(err);
			categorias = result;
			//console.log(problema);
			//console.log(categorias);
			res.render('admin/edit/editProblem', {problem: problema, categories: categorias});
		});
	});
}

exports.editProblem = function(req, res) {
	var sqlUpdate = 'UPDATE problemas prob SET prob.idgrupos_problemas = ' + connections.connection.escape(req.body.category) + ', prob.resposta = ' + connections.connection.escape(req.body.answer) + ', prob.points = ' + connections.connection.escape(req.body.points) + ', prob.description = ' + connections.connection.escape(req.body.description) + ', prob.level = '+ connections.connection.escape(req.body.level)+' WHERE prob.idproblemas = ' + connections.connection.escape(req.params.id);
	
	connections.connection.query(sqlUpdate, function(err, result) {
		if(err) console.log(err);
		
		res.redirect('/editProblem/'+req.params.id);
	});
}


exports.listProblems = function(req, res) {
	var query = 'select * from problemas, grupos_problemas where problemas.idgrupos_problemas = grupos_problemas.idgrupos_problemas order by problemas.idgrupos_problemas';
	connections.connection.query(query, function(err, result){
		if(err) console.log(err);
		//console.log(result);
		res.render('admin/list/listProblems', {problems: result});
	});
}

exports.deleteProblem = function(req, res) {
	var sqlDeleteProblem = 'DELETE FROM problemas WHERE idproblemas = ' + connections.connection.escape(req.params.id);
	var sqlDeleteProblemTeamLog = 'DELETE FROM teams_log WHERE idproblemas = ' + connections.connection.escape(req.params.id);
	
	connections.connection.query(sqlDeleteProblemTeamLog, function(err, result) {
		if (err) console.log(err);
		
		//console.log(result);
		
		connections.connection.query(sqlDeleteProblem, function(err, result) {
			if (err) console.log(err);
			
			//console.log(result);
			
			res.redirect('/listProblems');
		});
	});
}


exports.options = function(req, res) {
	var sqlConfig = 'SELECT DATE_FORMAT(start_date, \'%Y-%m-%d %H:%i:%s\') as start_date, DATE_FORMAT(end_date, \'%Y-%m-%d %H:%i:%s\') as end_date, random_problem_opening_interval FROM config';
	connections.connection.query(sqlConfig, function(errConfig, rowsConfig, fieldsConfig) {
		if(errConfig) console.log(errConfig);
		connections.connection.query('select * from grupos_problemas, problemas where grupos_problemas.idgrupos_problemas = problemas.idgrupos_problemas and problemas.open = false', function(err, result){
			if(err) console.log(err);
			//console.log(result);
			res.render('admin/config/options', {categories: result, config: rowsConfig[0]});
		});
	});
}

exports.editOptions = function(req, res) {
	var sqlConfig = 'SELECT DATE_FORMAT(start_date, \'%Y-%m-%d %H:%i:%s\') as start_date, DATE_FORMAT(end_date, \'%Y-%m-%d %H:%i:%s\') as end_date, random_problem_opening_interval FROM config';
	//console.log(req.body.category);
	
	connections.connection.query('UPDATE config SET ?', {start_date: req.body.startDate, end_date: req.body.endDate, random_problem_opening_interval: req.body.random_problem_opening_interval}, function(err, result) {
		if(err) console.log(err);
		connections.connection.query(sqlConfig, function(errConfig, rowsConfig, fieldsConfig) {
			if(errConfig) throw errConfig;
			connections.connection.query('select * from grupos_problemas, problemas where grupos_problemas.idgrupos_problemas = problemas.idgrupos_problemas and problemas.open = false', function(err, result){
				if(err) console.log(err);
				//console.log(result);
				res.render('admin/config/options', {categories: result, config: rowsConfig[0]});
			});
			
		});
	});
}

exports.resetTeamlogs = function(req, res) {
	var sqlConfig = 'SELECT DATE_FORMAT(start_date, \'%Y-%m-%d %H:%i:%s\') as start_date, DATE_FORMAT(end_date, \'%Y-%m-%d %H:%i:%s\') as end_date, random_problem_opening_interval FROM config';
	var sqlResetTeamlogs = 'Delete from teams_log';
	var sqlResetProblems = 'UPDATE problemas set open = 0 where level > 1';
	var sqlResetTeamsOpenProblemsLevels = 'UPDATE teams SET problems_to_open_level_1 = 0, problems_to_open_level_2 = 0, problems_to_open_level_3 = 0, problems_to_open_level_4 = 0';
	connections.connection.query(sqlResetTeamsOpenProblemsLevels, function(err, result) {
		if(err) console.log(err);	
		connections.connection.query(sqlResetProblems, function(err, result) {
			if(err) console.log(err);
			connections.connection.query(sqlResetTeamlogs, function(err, result) {
				if(err) console.log(err);
				connections.connection.query(sqlConfig, function(errConfig, rowsConfig, fieldsConfig) {
					if(errConfig)  console.log(errConfig);
					connections.connection.query('select * from grupos_problemas, problemas where grupos_problemas.idgrupos_problemas = problemas.idgrupos_problemas and problemas.open = false', function(err, result){
						if(err) console.log(err);
						//console.log(result);
						res.render('admin/config/options', {categories: result, config: rowsConfig[0]});
					});
				});
			});
		});
	});
}

exports.comms = function(req, res) {
	/*var sqlConfig = 'SELECT DATE_FORMAT(start_date, \'%Y-%m-%d %h:%i:%s\') as start_date, DATE_FORMAT(end_date, \'%Y-%m-%d %h:%i:%s\') as end_date FROM config';
	console.log(req.body.category);
	
	connection.query('UPDATE config SET ?', {start_date: req.body.startDate, end_date: req.body.endDate}, function(err, result) {
		if(err) throw err;
		connection.query(sqlConfig, function(errConfig, rowsConfig, fieldsConfig) {
			if(errConfig) throw errConfig;*/
			res.render('admin/config/comms');
			
		/*});
	});*/
}
