$(document).ready(function() {

	
	var socket = io.connect();
	var selectedGroup = -1;
	var selectedProblem = -1;
	
	
	
	$("#reset").click(function() {
		console.log('reset');
		socket.emit('reloadConfig');
	});	
	
	$("#reloadConfig").click(function() {
		console.log('reload config');
		socket.emit('reloadConfig');
	});
	
	$("#sendMessage").click(function() {
		/* stop form from submitting normally */
		event.preventDefault();
		console.log('send message');
		socket.emit('globalMessage', {message: $('#message').val(), sticky: true});
	});
	
	$("#category").change(function() {
		selectedGroup = $(this).find("option:selected").attr("idgroup");
		selectedProblem = $(this).find("option:selected").attr("idproblem");
	});
	
	$("#adminActivateProblem").click(function() {
		console.log('send message to activate '+selectedGroup+' - '+selectedProblem);
		socket.emit('adminActivateProblem', {group: selectedGroup, problem: selectedProblem});
	});
	
});
