/**
 * Module dependencies.
 */
var express = require('express');
var io = require('socket.io');
var fs = require("fs");
var crypto = require('crypto');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mysql = require('mysql');
var connections = require('./BD/db.js');
var util = require('util');
var parseCookie = require("cookie").parse;
var hash = require('node_hash');
var cluster = require("cluster");
var numCPUs = require('os').cpus().length;

var RedisStore = require('connect-redis')(express);
var storeSession = new RedisStore;

var privateKey = fs.readFileSync('keys/privatekey.pem').toString();
var certificate = fs.readFileSync('keys/certificate.pem').toString();
var credentials = crypto.createCredentials({key: privateKey, cert: certificate});


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

util.log('Loading Configs from DB');

var startTimer, addProblemTimer;
var sqlConfig = 'SELECT start_date, end_date, random_problem_opening_interval FROM config';
connections.connection.query(sqlConfig, function(errConfig, rowsConfig, fieldsConfig) {
		if(errConfig) throw errConfig;
		var agora = Date.now();
		var start = new Date(rowsConfig[0].start_date).getTime();
		var end = new Date(rowsConfig[0].start_end).getTime();
		var randomAdd = rowsConfig[0].random_problem_opening_interval*60*1000;
		
		var timeToStart = Date.now().getTime - start.getTime;
		if(agora >= start){
			addProblemTimer = setInterval(addRandomProblem, randomAdd);
		}
		else{
			startTimer = setInterval(startCompetition, (start-agora));
		}
});

function startCompetition(randomAdd){
	util.log('Start a coisa, novo problema a cada '+randomAdd+'ms');
	clearInterval(startTimer);
	setInterval(addRandomProblem, randomAdd);
	sio.sockets.emit('start');
}

function endCompetition(){
	util.log('Fim da coisa');
	
}

function addRandomProblem(){
	util.log('add random problem!!!!!');
	var sqlProblems = 'Select * from problemas where open = 0';
	connections.connection.query(sqlProblems, function(err, rows, fields) {
		if(err) console.log (err);
		else if(rows.length > 0){
			var randomProblemRow = Math.floor((Math.random()*rows.length)+1);
			var problem = rows[randomProblemRow-1].idproblemas;
			var group = rows[randomProblemRow-1].idgrupos_problemas;
			//console.log(rows);
			//console.log('encontrei '+rows.length+' problemas');
			//console.log('random entre problemas -> '+Math.floor((Math.random()*rows.length)+1));
			var openProblem = 'Update problemas SET open = true where idproblemas = '+problem+' and idgrupos_problemas = '+group;
			connections.connection.query(openProblem, function(err, rows, fields) {
				if(err) console.log(err);
				else{
					sio.sockets.emit('activateProblem', {group: group, problem: problem });
					var sockets = sio.sockets;
					for(var i = 0; sockets[i]; i++){
						var checkTeamOpenStuff = 'Select * from teams where idteams = '+sockets[i].teamid;
						console.log(checkTeamOpenStuff);
						connections.connection.query(checkTeamOpenStuff, function(err, rowsuCanOpen, fields) {
							if(err) console.log(err);
							else{
								

								socket.emit('uCanOpen', { level1: rowsuCanOpen[0].problems_to_open_level_1,  level2: rowsuCanOpen[0].problems_to_open_level_2, level3: rowsuCanOpen[0].problems_to_open_level_3});
								
							}
						});
					}
				}
			});
		}
	});
}


var app = express.createServer({key: privateKey, cert: certificate});



// Configuration
var secret = 'eO+Hh]#[)v{h?&s~5XuQMIN4VV@H5%8>';
/*var MemoryStore = express.session.MemoryStore;
var store = new MemoryStore();*/



app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { layout: false, pretty:true });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
	secret: secret,
    store: storeSession,
	maxAge: new Date(Date.now() + 3600000),
	key: 'connect.sid'
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.dynamicHelpers(
  {
    session: function(req, res) {
      return req.session;
    },
    
    flash: function(req, res) {
      return req.flash();
    }
  }
);

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

passport.serializeUser(function(user, done) {
	done(null, user.idteams);
});

passport.deserializeUser(function(id, done) {	
	var sql = 'SELECT * FROM teams WHERE idteams = ' + connections.connection.escape(id);
	
	connections.connection.query(sql, function(err, rows, fields) {
		done(err, rows);
	});
});

passport.use(new LocalStrategy(
  function(username, password, done) {	
	var sql = 'SELECT * FROM teams WHERE name = ' + connections.connection.escape(username);
	
	connections.connection.query(sql, function(err, rows, fields) {
		if (err) { return done(err); }
		if(rows.length == 0){
			return done(null, false, { message: 'Unknown user' });
		}
		var user = rows[0];
		var dbPassword = rows[0].password;
		var sqlGetSalt = 'SELECT * FROM userHashes WHERE idteams = ' + rows[0].idteams;
		connections.connectionHashes.query(sqlGetSalt, function(err, rows, fields){
			if(rows && rows.length > 0){
				var teamPassword = hash.sha512(password, rows[0].salt);
				if(dbPassword != teamPassword){
					return done(null, false, { message: 'Invalid password' });
				}
				return done(null, user);
			}
			else{
				return done(null, false, { message: 'Invalid password' });
			}
		});
	});
  }
));

// Routes
var routes = require('./routes');
var index = require('./routes/index');
var score = require('./routes/score');
var sessions = require('./routes/sessions');
var administration = require('./routes/administration');
var registration = require('./routes/registration');

//Vai tudo para o score
app.get('/', index.index);
app.get('/score', sessions.requiresLogin, score.score);

app.post('/answer', sessions.requiresLogin, score.answer);

app.get('/login', sessions.login);
app.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login', failureFlash: true }));
app.get('/logout', sessions.logout);

app.get('/register', registration.register);
app.post('/register', registration.checkRegistration, passport.authenticate('local', {successRedirect: "/", failureReditect: "/register", failureFlash: true}));

app.get('/dashboard', sessions.requiresAdminLogin, administration.dashTemplate);

app.get('/addTeam', sessions.requiresAdminLogin, administration.addTeam);
app.post('/insertTeam', sessions.requiresAdminLogin, administration.insertTeam);
app.get('/editTeam/:id', sessions.requiresAdminLogin, administration.showEditTeam);
app.post('/editTeam/:id', sessions.requiresAdminLogin, administration.editTeam);
app.get('/listTeams', sessions.requiresAdminLogin, administration.listTeams);
app.get('/deleteTeam/:id', sessions.requiresAdminLogin, administration.deleteTeam);

app.get('/addChallenge', sessions.requiresAdminLogin, administration.addChallenge);
app.get('/listChallenges', sessions.requiresAdminLogin, administration.listChallenges);

app.get('/addCategory', sessions.requiresAdminLogin, administration.addCategory);
app.post('/insertCategory', sessions.requiresAdminLogin, administration.insertCategory);
app.get('/editCategory/:id', sessions.requiresAdminLogin, administration.showEditCategory);
app.post('/editCategory/:id', sessions.requiresAdminLogin, administration.editCategory);
app.get('/deleteCategory/:id', sessions.requiresAdminLogin, administration.deleteCategory);
app.get('/listCategories', sessions.requiresAdminLogin, administration.listCategories);

app.get('/addProblem', sessions.requiresAdminLogin, administration.addProblem);
app.post('/insertProblem', sessions.requiresAdminLogin, administration.insertProblem);
app.get('/listProblems', sessions.requiresAdminLogin, administration.listProblems);
app.get('/editProblem/:id', sessions.requiresAdminLogin, administration.showEditProblem);
app.post('/editProblem/:id', sessions.requiresAdminLogin, administration.editProblem);
app.get('/deleteProblem/:id', sessions.requiresAdminLogin, administration.deleteProblem);

app.get('/resetTeamlogs', sessions.requiresAdminLogin, administration.options);
app.get('/options', sessions.requiresAdminLogin, administration.options);
app.get('/editOptions', sessions.requiresAdminLogin, administration.options);
app.post('/editOptions', sessions.requiresAdminLogin, administration.editOptions);
app.post('/resetTeamlogs', sessions.requiresAdminLogin, administration.resetTeamlogs);
app.get('/comms', sessions.requiresAdminLogin, administration.comms);


	app.listen(3000, function(){
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
  });

//}
/**
 * Socket.IO server (single process only)
 */

var sessoesStore = io.RedisStore;
var sio = io.listen(app,{key: privateKey, cert: certificate, secure: true});
sio.configure(function () {
	sio.set('store', new sessoesStore);
	sio.set('log level', 1);                    // reduce logging
});
sio.set('log level', 1); // reduce logging

sio.sockets.on('connection', function (socket) {
	var hs = socket.handshake;
	var session = socket.handshake.session;
	var headers = socket.handshake.headers;
	try{
		socket.teamid = parseCookie(socket.handshake.headers.cookie).teamid;
		socket.teamname = parseCookie(socket.handshake.headers.cookie).teamname;
		}
	catch(err){
		util.log('erro -> '+err);
	}

  
	socket.on('answer', function (data) {
		var teamid = parseCookie(socket.handshake.headers.cookie).teamid;
		var teamname = parseCookie(socket.handshake.headers.cookie).teamname;
		var problem = data.problem;
		var group = data.group;
		var answer = data.answer;
		verifyAnswer(socket, teamname, teamid, group, problem, answer);
	});
	
	socket.on('reloadConfig', function (data) {
		clearInterval(startTimer);
		clearInterval(addProblemTimer);
		var sqlConfig = 'SELECT start_date, end_date, random_problem_opening_interval FROM config';
		connections.connection.query(sqlConfig, function(errConfig, rowsConfig, fieldsConfig) {
			if(errConfig) throw errConfig;
			var agora = Date.now();
			var start = new Date(rowsConfig[0].start_date).getTime();
			var end = new Date(rowsConfig[0].start_end).getTime();
			var randomAdd = rowsConfig[0].random_problem_opening_interval*60*1000;
			var timeToStart = Date.now().getTime - start.getTime;
			if(agora >= start){
				addProblemTimer = setInterval(addRandomProblem, randomAdd);
			}
			else{
				startTimer = setInterval(startCompetition, (start-agora));
			}
		});
		sio.sockets.emit('start');
	});
	
	socket.on('globalMessage', function (data) {
		sio.sockets.emit('globalMessage', data);
	});
	
	socket.on('adminActivateProblem', function (data) {
		var openProblem = 'Update problemas SET open = true where idproblemas = '+data.problem+' and idgrupos_problemas = '+data.group;
		connections.connection.query(openProblem, function(err, rows, fields) {
			if(err) console.log(err);
			else{
				sio.sockets.emit('activateProblem', {group: data.group, problem: data.problem });
				var sockets = sio.sockets;
				for(var i = 0; sockets[i]; i++){
					var checkTeamOpenStuff = 'Select * from teams where idteams = '+sockets[i].teamid;
					console.log(checkTeamOpenStuff);
					connections.connection.query(checkTeamOpenStuff, function(err, rowsuCanOpen, fields) {
						if(err) console.log(err);
						else{
							socket.emit('uCanOpen', { level1: rowsuCanOpen[0].problems_to_open_level_1,  level2: rowsuCanOpen[0].problems_to_open_level_2, level3: rowsuCanOpen[0].problems_to_open_level_3});
						}
					});
				}
			}
		});
	});
	
	socket.on('openProblem', function (data) {
		var idproblema = data.problem;
		var idgroup = data.group;
		var sqlProblem = 'SELECT * from problemas where idgrupos_problemas = '+idgroup+' and idproblemas = '+idproblema;
		connections.connection.query(sqlProblem, function(err, rows, fields) {
			if(err) util.log(err);
			
			if(rows.length > 0){
				var open = rows[0].open;
				if(open){
					console.log('dafuq, already open');
				}
				
				else{
					var level = rows[0].level;
					var sqlTeams = 'SELECT * FROM teams where idteams = '+socket.teamid;
					connections.connection.query(sqlTeams, function(err, rows, fields) {
						if(err) util.log(err);
						if(rows.length > 0){
							var ok = false;
							if(level == 2 && rows[0].problems_to_open_level_1>0){
								ok = true;
							}
							else if(level == 3 && rows[0].problems_to_open_level_2>0){
								ok = true;
							}
							else if(level == 4 && rows[0].problems_to_open_level_3>0){
								ok = true;
							}
							if(ok){
								var openProblem = 'Update problemas SET open = true where idproblemas = '+idproblema+' and idgrupos_problemas = '+idgroup;
								connections.connection.query(openProblem, function(err, rows, fields) {
									if(err) util.log(err);
									else{
										var retirarProblemaQueTeamPodeAbrir = 'UPDATE teams SET problems_to_open_level_'+(level-1)+' = problems_to_open_level_'+(level-1)+' - 1 WHERE idteams = '+socket.teamid;
										connections.connection.query(retirarProblemaQueTeamPodeAbrir, function(err, rows, fields) {
											if(err) util.log(err);
											else{
												var checkTeamOpenStuff = 'Select * from teams where idteams = '+socket.teamid;
												connections.connection.query(checkTeamOpenStuff, function(err, rowsuCanOpen, fields) {
													if(err) console.log(err);
													else{
														socket.emit('uCanOpen', { level1: rowsuCanOpen[0].problems_to_open_level_1,  level2: rowsuCanOpen[0].problems_to_open_level_2, level3: rowsuCanOpen[0].problems_to_open_level_3});
														sio.sockets.emit('activateProblem', {group: idgroup, problem: idproblema });
													}
												});
											}
										});
									}
								});
							}
						}
					});
				}
			}
			
		});
	});
	
	socket.on('getProblem', function (data) {
		var idproblema = data.problem;
		var idgroup = data.group;
		var sqlProblem = 'SELECT* from problemas where idgrupos_problemas = '+idgroup+' and idproblemas = '+idproblema;
		connections.connection.query(sqlProblem, function(err, rows, fields) {
			if(err) util.log(err);
			var description = '';
			
			if(rows.length > 0){
				description = rows[0].description;
				var open = rows[0].open;
				socket.emit('problemDefinition', {group: idgroup, problem: idproblema, description: description, open: open});
			}
		});
	});
});


function verifyAnswer(socket, teamname, teamid, group, problem, answer){
	//Ver se ainda aceita respostas
	var sqlConfig = 'SELECT * from config';
	
	var sqlTeamsPoints = 'SELECT t.idteams, name, sum(p.points) as points, (SELECT data from teams_log where teams_log.idteams = t.idteams order by data desc limit 1) as data '
										+'FROM teams '
										+'LEFT JOIN teams_log as t  on t.idteams = teams.idteams  '
										+'LEFT JOIN problemas as p ON t.idgrupos_problemas = p.idgrupos_problemas AND t.idproblemas = p.idproblemas  '
										+'where administrationLevel = 0 and (t.correct = 1 OR t.correct IS NULL)  '
										+'group by teams.idteams order by points desc, data asc '

	var sqlTeamSumOfPoints = 'SELECT teams.idteams, teams.name, sum(p.points) as points '
		+'FROM teams '
		+'LEFT JOIN teams_log as t on t.idteams = teams.idteams '
		+'LEFT JOIN problemas as p ON t.idgrupos_problemas = p.idgrupos_problemas AND t.idproblemas = p.idproblemas '
		+'where administrationLevel = 0 and (t.correct = 1 OR t.correct IS NULL OR data IS NULL OR points IS NULL) '
		+'and teams.idteams = '+teamid+' '
		+'group by teams.idteams ';



	var sqlCheckifAlreadyAnswered = 'SELECT * from teams_log as t where t.idteams = '+teamid+' and t.idgrupos_problemas = '+group+' and t.idproblemas = '+problem+' and t.correct = 1';
	
	var sqlVerifyAnswer = '	SELECT * from problemas as p, grupos_problemas as g where g.idgrupos_problemas = p.idgrupos_problemas and p.idgrupos_problemas = '+group+' and p.idproblemas ='+problem;


	var now = new Date();
	var somapontos = 0;
	var correct = false;
	connections.connection.query(sqlConfig, function(err, rowsConfig, fields) {
		//Verificar se ainda está a decorrer
		if(now > rowsConfig[0].start_date && now < rowsConfig[0].end_date){
			//Ver se já respondeu
			connections.connection.query(sqlCheckifAlreadyAnswered, function(err, rows, fields) {
				if(err){ 
					util.log(sqlCheckifAlreadyAnswered);
					util.log(err);
				}
				if(rows.length == 0){
					connections.connection.query(sqlVerifyAnswer, function(err, rowsProblems, fields) {
						if(err){ 
							util.log(sqlVerifyAnswer);
							util.log(err);
						}
						if(rowsProblems.length > 0){
							if(answer.toUpperCase() == rowsProblems[0].resposta.toUpperCase()){
								correct = true;
								
								var querySoma = 'SELECT sum_of_points from teams_log where idteams = '+teamid+' order by data desc limit 1';
								connections.connection.query(querySoma, function(err, result) {
									if(err){
										util.log(err);
										util.log(querySoma);
									}
									//util.log(result);
									if(result.length>0){
										somapontos = rowsProblems[0].points + result[0].sum_of_points;
									}
									else{
										somapontos = rowsProblems[0].points;
									}
									var queryInsertLogCorrect ='INSERT INTO teams_log (idteams ,data ,resposta ,correct ,idgrupos_problemas,idproblemas,sum_of_points) '
												+' VALUES ('+teamid+',NOW(),\''+answer+'\','+1+','+group+','+problem+', '+somapontos+') ';
									var query = connections.connection.query(queryInsertLogCorrect, function(err, result) {
										if(err){
											util.log(err);
											util.log(queryInsertLogCorrect);
										}
										connections.connection.query(sqlTeamsPoints, function(errTeams, rowsTeams, fieldsTeams) {
												sio.sockets.emit('leader', { teams: rowsTeams});
										});
										var queryIncrementTeamProblemsOpen = 'UPDATE teams SET problems_to_open_level_'+rowsProblems[0].level+' = problems_to_open_level_'+rowsProblems[0].level+' + 1 WHERE idteams = '+teamid;
										connections.connection.query(queryIncrementTeamProblemsOpen, function(err, rows, fields) {
												if(err) console.log(err);
												else{
													var checkTeamOpenStuff = 'Select * from teams where idteams = '+teamid;
													connections.connection.query(checkTeamOpenStuff, function(err, rowsuCanOpen, fields) {
														if(err) console.log(err);
														else{	
															if((rowsProblems[0].level+1) <= 4){
																var msg = 'Congrats, u can now open a problem from level '+(rowsProblems[0].level+1)+'.';
																socket.emit('globalMessage', { message: msg, sticky: false});
																socket.emit('uCanOpen', { level1: rowsuCanOpen[0].problems_to_open_level_1,  level2: rowsuCanOpen[0].problems_to_open_level_2, level3: rowsuCanOpen[0].problems_to_open_level_3});
															}
															connections.connection.query(sqlTeamSumOfPoints, function(errTeamSumOfPoints, rowsTeamSumOfPoints, fieldsTeamSumOfPoints) {
																if(err) console.log(err);
																if(rowsTeamSumOfPoints.length > 0){
																	sio.sockets.emit('answers', { teamname: teamname, teamid: teamid, group: group, problem: problem, correct: correct, sum_of_points: rowsTeamSumOfPoints[0].points, groupname: rowsProblems[0].name, time: (new Date()) });
																}
																else{
																	util.log('erro ao obter pontos');
																}
															});
														}
													});
												}
										});
									});
								});
							}
							//Resposta errada
							else{
								correct = false;
								var querySumDosPontos = 'SELECT t.sum_of_points as points1 from teams_log as t where t.idteams = '+teamid+' order by t.data desc limit 1';
								var query = connections.connection.query(querySumDosPontos, function(err, result) {
									if(err){ 
										util.log(err);
										util.log(querySumDosPontos);
									}
									else {
										var soma = 0;
										if(result.length>0){ 
											soma = result[0].points1;
										}
										var queryInsertLogFalse ='INSERT INTO teams_log (idteams ,data ,resposta ,correct ,idgrupos_problemas,idproblemas,sum_of_points) '
											+' VALUES ('+teamid+',NOW(),\''+answer+'\','+0+','+group+','+problem+', '+soma+') ';
													
										var query = connections.connection.query(queryInsertLogFalse, function(err, result) {
											if(err){ 
												util.log('Error inserting answer in BD -> '+err);
												util.log(queryInsertLogFalse);
											}
											connections.connection.query(sqlTeamSumOfPoints, function(errTeamSumOfPoints, rowsTeamSumOfPoints, fieldsTeamSumOfPoints) {
												if(err) console.log(err);
												var pontos = 0;
												if(rowsTeamSumOfPoints.length > 0){
													pontos = rowsTeamSumOfPoints[0].points;
												}
												sio.sockets.emit('answers', { teamname: teamname, teamid: teamid, group: group, problem: problem, correct: correct, sum_of_points: pontos, groupname: rowsProblems[0].name, time: (new Date()) });
											});
										});
									}
								});

							}							
						}
					});
				}
			});
		}
		else{
			correct = false;
			sio.sockets.emit('answers', { teamname: teamname, teamid: teamid, group: group, problem: problem, correct: correct, time: (new Date())  });
		}

	});

}


