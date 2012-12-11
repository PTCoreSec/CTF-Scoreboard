$(document).ready(function() {
	
	//console.log('consigo aceder var level1 - '+level1);
	
	var level1 = 0;
	var level2 = 0;
	var level3 = 0;
	
	var selectedGroup =-1;
	var selectedProblem =-1;
	var selectedId;
	
	var socket = io.connect(null, {
	  'reconnect': true,
	  'reconnection delay': 250,
	  'max reconnection attempts': 100
	});
	
	var snd; // buffers automatically when created
	//var no = new Audio("yes.mp3"); // buffers automatically when created
	
	
	$('#problem_description').hide();
	$('#answerInput').hide();
	$('#submitAnswer').hide();
	$('#feedback').hide();
	
	socket.on('reconnect', function (data) {
		window.location.reload(true);
	});
	
	socket.on('start', function (data) {
		window.location.reload(true);
	});
	
	socket.on('uCanOpen', function (data) {
		//console.log(data);
		level1 = data.level1;
		level2 = data.level2;
		level3 = data.level3;
		checkWhatICanOpenz();
	});

	function checkWhatICanOpenz(){
		$('div.exampleborderradiusa').each(function(index) {
			var level = jQuery(this).attr("level");
			if((level == 2 && level1>0) || (level == 3 && level2>0) || (level3>0 && level == 4)){
				if(jQuery(this).hasClass('pontuacao_closed')){
					jQuery(this).removeClass("pontuacao_closed");
					jQuery(this).addClass("pontuacao_can_open");
				}
			}
			if((level == 2 && level1==0) || (level == 3 && level2==0) || (level3==0 && level == 4)){
				if(jQuery(this).hasClass('pontuacao_can_open')){
					jQuery(this).removeClass("pontuacao_can_open");
					jQuery(this).addClass("pontuacao_closed");
				}
			}
			
		});
	}
	
	socket.on('globalMessage', function (data) {
		$().toastmessage('showToast', {
			text     : data.message,
			sticky   : data.sticky,
			type     : 'notice'
		});
	});
	
	socket.on('answers', function (data) {
		if(snd){
			snd.pause();
		}
		$('#newstext').append('<p>'+data.correct+'</p>');
		$('#newsscroll').scrollTo( '100%', 10 , {
			axis:'y'
		});
		
		var teamid = data.teamid;
		var group = data.group;
		var problema = data.problem;
		var correct = data.correct;
		if(teamid == $('#teamId').attr("team")){
			if(correct){
				document.getElementById("feedback").innerHTML ='<p style=\'color:lightgreen;\'>Correct.</p>';
				$('#feedback').addClass("success");
				//$("#myModal").effect("highlight", {color: 'green'}, 3000); 
				$("div#"+group+''+problema).removeClass("pontuacao_no_answer");
				$("div#"+group+''+problema).removeClass("pontuacao_selected");
				$("div#"+group+''+problema).addClass("pontuacao_correct");
				
				snd = new Audio("yes.mp3");
				snd.play();
			}
			else{
				$('#submitAnswer').attr("disabled", false);
				document.getElementById("feedback").innerHTML ='<p style=\'color:darkred;\'>Computer says No.</p>';
				$('#feedback').addClass("error");
				snd = new Audio("no5s.ogg");
				//snd.play();
				//setInterval(snd.pause(),2000);
			}
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
	
	socket.on('activateProblem', function (data) {	
		$("div#"+data.group+''+data.problem).removeClass("pontuacao_can_open");
		$("div#"+data.group+''+data.problem).removeClass("pontuacao_closed");
		$('#'+data.group+''+data.problem).addClass("pontuacao_no_answer");
		problemClick(data.group+''+data.problem, data.group, data.problem);
		$().toastmessage('showToast', {
			text     : 'le wild problem appeared..',
			sticky   : false,
			type     : 'notice'
		});
	});
	
	socket.on('problemDefinition', function (data) {	
		var group = data.group;
		var problema = data.problem;
		var open = data.open;
		if(group == selectedGroup && problema == selectedProblem){
			var description = data.description;
			document.getElementById("feedback").innerHTML ='';
			document.getElementById("problem_description").innerHTML = description;
			$('#answerInput').val("");
			$('#problem_description').show();
			if(open){
				$('#answerInput').show();
				$('#submitAnswer').show();
				$('#feedback').show();
				$('#submitAnswer').attr("disabled", false);
				$('#answerInput').focus();
			}
			else{
				$('#answerInput').hide();
				$('#submitAnswer').hide();
				$('#feedback').hide();
			}
		}
	});
	

	$('div.exampleborderradiusa').each(function(index) {
		var id = jQuery(this).attr("id");
		var group = jQuery(this).attr("group");
		var problem = jQuery(this).attr("problem");
		problemClick(id, group, problem);
	});
	
	function problemClick(id, group, problem){
		$('#'+id).click(function(event) {
			$('#answerInput').hide();
			$('#submitAnswer').hide();
			$('#feedback').hide();
			if($('#'+id).hasClass('pontuacao_no_answer')){
				selectedGroup = group;
				selectedProblem = problem;
				socket.emit('getProblem', {'group': selectedGroup,'problem': selectedProblem});
				clearSelected();
				document.getElementById("feedback").innerHTML ='';
				document.getElementById("problem_description").innerHTML = 'Loading..';
				$('#answerInput').val("");
				$("#"+id).addClass("pontuacao_selected");
			}
			if($('#'+id).hasClass('pontuacao_closed') || $('#'+id).hasClass('pontuacao_can_open')){
				selectedGroup = group;
				selectedProblem = problem;
				socket.emit('openProblem', {'group': selectedGroup,'problem': selectedProblem});
			}
		});
	}
	
	$("#submitAnswer").click(function(event) {
		event.preventDefault();
		document.getElementById("feedback").innerHTML ='<p>Waiting Response.</p>';
		socket.emit('answer', {'group': selectedGroup,'problem': selectedProblem, 'answer': $('#answerInput').val()});
		$('#submitAnswer').attr("disabled", true);
	});

	
	function clearSelected(){
		$('div.exampleborderradiusa').each(function(index) {
			var thisId = jQuery(this).attr("id");
			jQuery(this).removeClass("pontuacao_selected");
		});
	}
});



 