
/*
 * GET home page.
 */
 
 var mysql      = require('mysql');
 var util = require('util');
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

connections.connection.on('error', function(err) {
  util.log(err.code); // 'ER_BAD_DB_ERROR'
  	util.log('ligacao caiu mas vou restabelecer');
    connections.connection = mysql.createConnection(connections.connection.config);
});

exports.answer= function(req, res){
	console.log('Recebi uma answer');
	console.log(req.body);

}




exports.score = function(req, res){
	var sqlGrupos = 'SELECT * FROM torneio.grupos_problemas';
	var problems = new Array;
	var groups = new Array;
	connections.connection.query(sqlGrupos, function(errGroups, rowsGroups, fieldsGroups) {
		if(errGroups){
			console.log('err - '+errGroups);
		}
		if(rowsGroups.length == 0){
			console.log('Nao encontrei nada');
			callbackRender(req, res, {}, {});
		}
		else{
			groups = rowsGroups;
			var totalGroups = 0;
			for(var i = 0; rowsGroups[i];i++){
				var sqlProblemas = 'SELECT p.*, SUM(t.correct) as correct FROM problemas as p LEFT JOIN teams_log as t '
									+' on p.idgrupos_problemas = t.idgrupos_problemas and p.idproblemas = t.idproblemas ' 
									+' and t.idteams = '+req.session.teamId+' '
									+ 'where p.idgrupos_problemas = '+rowsGroups[i].idgrupos_problemas+' '
									+' group by p.idproblemas ORDER by points';
				connections.connection.query(sqlProblemas, function(err, rows, fields) {
					if(err){
						console.log('err - '+err);
						totalGroups++;
					}
					else{
						problems[totalGroups] = rows;
						totalGroups++;
						if(totalGroups == rowsGroups.length){
							callbackRender(req, res, groups, problems)
						}
					}
				});
			}
		}
	});
}


function callbackRender(req, res, groups, problems){
	var teams = new Array;
	var sqlConfig = 'SELECT * from config';
	var sqlTeams = 'SELECT * FROM teams where administrationLevel = 0';		

	var sqlTeamsPoints = 'SELECT t.idteams, name, sum(p.points) as points, (SELECT data from teams_log where teams_log.idteams = t.idteams order by data desc limit 1) as data '
		+ ', problems_to_open_level_1, problems_to_open_level_2, problems_to_open_level_3, problems_to_open_level_4 '
		+'FROM teams '
		+'LEFT JOIN teams_log as t  on t.idteams = teams.idteams  '
		+'LEFT JOIN problemas as p ON t.idgrupos_problemas = p.idgrupos_problemas AND t.idproblemas = p.idproblemas  '
		+'where administrationLevel = 0 and (t.correct = 1 OR t.correct IS NULL)  '
		+'group by teams.idteams order by points desc, data asc '
	connections.connection.query(sqlTeamsPoints, function(errTeams, rowsTeams, fieldsTeams) {
		if(errTeams){
			console.log('errTeams - '+errTeams);
		}
		connections.connection.query(sqlConfig, function(errConfig, rowsConfig, fieldsConfig) {
			req.session.user = req.user[0].name;
			res.cookie('teamid', req.session.teamId);
			res.cookie('teamname', req.user[0].name);
			req.session.path = req.route.path;
			req.session.administrationLevel = req.user[0].administrationLevel;
			var open;
			var now = new Date();
			if(now < rowsConfig[0].start_date){
				open = false;
			}
			else{
				open = true;
			}
			var level1 = 0;
			var level2 = 0;
			var level3 = 0;
			for(var i = 0; rowsTeams[i];i++){
				if(rowsTeams[i].idteams == req.session.teamId){
					level1 = rowsTeams[i].problems_to_open_level_1;
					level2 = rowsTeams[i].problems_to_open_level_2;
					level3 = rowsTeams[i].problems_to_open_level_3;
				}
			}
			res.render('score', { title: 'PTCoreSec Scoreboard', thisteam: req.session.teamId, level1: level1, level2: level2, level3: level3, open: open, config: rowsConfig, groups: groups, problems: problems, teams: rowsTeams})
		});
	});
}