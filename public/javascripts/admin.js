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

	$("#teamEditPassword").submit(function(event) {
		event.preventDefault();

		var $form = $(this),
			password = $form.find("input[name='teamPassword']").val(),
			confirmPassword = $form.find("input[name='confirmTeamPassword']").val(),
			teamID = $form.find("input[name='teamid']").val();

		var posting = $.post("/editTeamPassword", {teamPassword: password, confirmTeamPassword: confirmPassword, teamid: teamID}, "json")

		posting.done(function(data) {
			var message = data.message;
			var success = data.success;
			alert(message);
			if(success) {
				$("#teamEditPassword").clearForm();
			}
		});
	});
});

$.fn.clearForm = function() {
  return this.each(function() {
    var type = this.type, tag = this.tagName.toLowerCase();
    if (tag == 'form')
      return $(':input',this).clearForm();
    if (type == 'text' || type == 'password' || tag == 'textarea')
      this.value = '';
    else if (type == 'checkbox' || type == 'radio')
      this.checked = false;
    else if (tag == 'select')
      this.selectedIndex = -1;
  });
};
