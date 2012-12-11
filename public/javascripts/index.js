$(document).ready(function() {
	var socket = io.connect();
		
	socket.on('globalMessage', function (data) {
		$().toastmessage('showToast', {
			text     : data.message,
			sticky   : data.sticky,
			type     : 'notice'
		});
	});
	
	socket.on('start', function (data) {
		window.location.reload(true);
	});
	
	socket.on('reconnect', function (data) {
		window.location.reload(true);
	});
	
	socket.on('activateProblem', function (data) {	
		$("div#"+data.group+''+data.problem).removeClass("pontuacao_closed");
		$('#'+data.group+''+data.problem).addClass("pontuacao_no_answer");
		$().toastmessage('showToast', {
			text     : 'le wild problem appeared..',
			sticky   : false,
			type     : 'notice'
		});
	});
	
	socket.on('answers', function (data) {
		var teamid = data.teamid;
		var teamname = data.teamname;
		var group = data.group;
		var groupname = data.groupname;
		var problema = data.problem;
		var correct = data.correct;
		var sum_of_points = data.sum_of_points;
		//var myDate = new Date();
		var myDate = new Date(data.time);
		var timezone_delay = -myDate.getTimezoneOffset()*60*1000;
		myDate = new Date(myDate.getTime() + timezone_delay);
		var found = false;
		
		//console.log('Recebi pontos da team '+teamid+ ' - '+teamname+' - pontos '+sum_of_points+' data- '+myDate);
		
		for(var i = 0; chart.series[i]; i++){
			if(chart.series[i].options.id == teamid){
				if (!sum_of_points){
					sum_of_points = 0;
				}
				found = true;
				//console.log(chart.series[i].legendItem);
				var el = $(chart.series[i].legendItem.element); 
				el.text(teamname+' - '+sum_of_points);
				var myCss = function(){el.css("font-size","12px")};
				myCss();
				el.hover(myCss).click(myCss);
				chart.series[i].addPoint({name: groupname, x: myDate.getTime(), y:parseInt(sum_of_points)});
			}
		}
		if(correct){
			$("div#"+group+''+problema).removeClass("pontuacao_no_answer");
			$("div#"+group+''+problema).removeClass("pontuacao_selected");
			$("div#"+group+''+problema).addClass("pontuacao_correct");
		}
	});
	
	socket.on('leader', function (data) {
		var leaderBoard = "";
		for(var i = 0; data.teams[i]; i++){
			var name = data.teams[i].name;
			var points = 0;
			if(data.teams[i].points){
				points = data.teams[i].points;
			}
			if(data.teams[i].idteams == $('#teamId').attr("team")){
				leaderBoard +='<p style=\'color: white;\'>'+name+' - '+points+'</p>';
			}
			else{
				leaderBoard +='<p>'+name+' - '+points+'</p>';
			}
		}
		
		document.getElementById("scores").innerHTML = leaderBoard;
	});
});
