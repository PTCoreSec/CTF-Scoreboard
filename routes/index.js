
/*
 * GET home page.
 */
 
 var mysql = require('mysql');
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


exports.index = function(req, res){
	var sqlGrupos = 'SELECT * FROM torneio.grupos_problemas';
	var problems = new Array;
	var groups = new Array;
	connections.connection.query(sqlGrupos, function(errGroups, rowsGroups, fieldsGroups) {
		if(errGroups){
			console.log('err - '+errGroups);
		}
		if(rowsGroups.length == 0){
			callbackRender(req, res, {}, {})
		}
		else{
			groups = rowsGroups;
			var totalGroups = 0;
			for(var i = 0; rowsGroups[i];i++){
				var sqlProblemas = 'SELECT p.*, SUM(t.correct) as correct FROM problemas as p LEFT JOIN teams_log as t '
									+' on p.idgrupos_problemas = t.idgrupos_problemas and p.idproblemas = t.idproblemas ' 
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
};

function callbackRender(req, res, groups, problems){
	var teams = new Array;
	var sqlTeams = 'SELECT * FROM teams where administrationLevel = 0';	
	var sqlConfig = 'SELECT * from config';
	var sqlTeamsPoints = 'SELECT t.idteams, name, sum(p.points) as points, (SELECT data from teams_log where teams_log.idteams = t.idteams order by data desc limit 1) as data '
		+ ', problems_to_open_level_1, problems_to_open_level_2, problems_to_open_level_3, problems_to_open_level_4 '
		+'FROM teams '
		+'LEFT JOIN teams_log as t  on t.idteams = teams.idteams  '
		+'LEFT JOIN problemas as p ON t.idgrupos_problemas = p.idgrupos_problemas AND t.idproblemas = p.idproblemas  '
		+'where administrationLevel = 0 and (t.correct = 1 OR t.correct IS NULL)  '
		+'group by teams.idteams order by points desc, data asc '
	var sqlTeamsPointsLogs = 'SELECT t.idteams, DATE_FORMAT(t.data, \'%Y-%m-%d %H:%i:%s\') as data, t.sum_of_points, gp.name from teams_log as t, teams, grupos_problemas as gp where t.idteams = teams.idteams and t.idgrupos_problemas = gp.idgrupos_problemas order by data';
	connections.connection.query(sqlTeamsPoints, function(errTeams, rowsTeams, fieldsTeams) {
			connections.connection.query(sqlTeamsPointsLogs, function(err, rowsLogs, fieldsLogs) {
				if(req.user){
					if(req.user[0]){
						req.session.user = req.user[0].name;
						res.cookie('teamid', req.session.teamId);
						req.session.administrationLevel = req.user[0].administrationLevel;
					}
				}
				req.session.path = req.route.path;
				var processLogs = [];
				var teamsDataAll = [];
				for(var i = 0; rowsLogs[i];i++){
					if(teamsDataAll[rowsLogs[i].idteams]){
						if(rowsLogs[i].sum_of_points){
							var myDate = new Date(rowsLogs[i].data);
							var timezone_delay = -myDate.getTimezoneOffset()*60*1000;
							myDate = new Date(myDate.getTime() + timezone_delay);
							teamsDataAll[rowsLogs[i].idteams].push({name: rowsLogs[i].name, x:(myDate).getTime(), y:rowsLogs[i].sum_of_points});
						}
					}
					else{
						teamsDataAll[rowsLogs[i].idteams] = new Array();
						var myDate = new Date(rowsLogs[i].data);
						var timezone_delay = -myDate.getTimezoneOffset()*60*1000;
						myDate = new Date(myDate.getTime() + timezone_delay);

						teamsDataAll[rowsLogs[i].idteams].push({name: rowsLogs[i].name, x: (myDate).getTime(), y:rowsLogs[i].sum_of_points});
					}
				}


				connections.connection.query(sqlTeams, function(errTeams, rows, fields) {
					
					for(var i = 0; rows[i];i++){
						var teamid = rows[i].idteams;
						if(teamsDataAll[rows[i].idteams]){
							processLogs.push({name: rows[i].name, id: teamid, data: teamsDataAll[rows[i].idteams]});
						}
						else {
							if(rows[i].administrationLevel == 0){
								processLogs.push({name: rows[i].name, id: teamid, data: []});
							}
						}
					}
					
					connections.connection.query(sqlConfig, function(errConfig, rowsConfig, fieldsConfig) {
						res.render('index', { title: 'PTCoreSec Scoreboard', config: rowsConfig, groups: groups, problems: problems, teams: rowsTeams, logs: processLogs});
					});
				});

		});
	});
}