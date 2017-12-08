//////////////////// Initialisation de socket.io ////////////////////





var socket = io();

socket.on('connect', function() {
    socket.on('fromClient', function(msg) { //Socket écoute tout les messages de 'fromClient'
        updateManager(msg); // Va trier les messages reçu
    });
});





//////////////////// Communication vers le client ////////////////////





$("#newSession").click(function() {
    //Prend la valeur pour l'envoyer dans la fonction
    var sessionName = $('#sessionName').val();
    populateForm("sessionName", sessionName);
    socket.emit('fromConsole', { event: 'SESSION_START' }); //Envoi du message au client
});


$("#submit_save").click(function() { //Sauvegarde la session
    socket.emit('fromConsole', { event: 'RESET' }); //Envoi du message au client
    $("#saveForm").submit(); // Sauvegarde dans la DB
});


$("#submit_no_save").click(function() { //Ne sauvegarde pas la session
    socket.emit('fromConsole', { event: 'RESET' }); //Envoi du message au client
    location.reload();
});

var envoiCommande = function(event) { // Se trouve inline
    socket.emit('fromConsole', { event: event }); //Envoi du message au client
}







//////////////////// Communication du client ////////////////////






var updateManager = function(msg) {
    switch (msg.event) {
        case 'TIMEUPDATE':

            // Une fois que la video est en marche, 
            //cette case est déclenchée toutes les secondes
            // Ne fait que mettre à jour le timer

            var foo = readableDuration(Math.round(msg.data));
            document.getElementById('timer').innerHTML = foo;
            break;

        case 'MCQ':
            // Remplit le formulaire caché et modifie le DOM avec les réponses
            populateForm((msg.mcq_num + 1), msg.data);
            break;

        case 'ONENDED':
            // La vidéo est terminée
            $('#myModal_3').modal('show');
            $('#myModal').modal('hide');
            break;
        case 'BEGIN':
            // Active les boutons de validation des QCM
            $("#is_true").removeClass("disabled").addClass("active");
            $("#is_false").removeClass("disabled").addClass("active");
            break;
        case 'END':
            // Désactive les boutons de validation du QCM
            $("#is_true").removeClass("active").addClass("disabled");
            $("#is_false").removeClass("active").addClass("disabled");
            break;
    }
}

var populateForm = function(questionNum, val) {

    // questionNum et val peuvent qualifer 
    // soit sessionName et le nom de la nouvelle session 
    // soit le numéro de question et la réponse vrai ou faux.
    // Cette fonction modifie le DOM et rempli le formulaire caché.

    var reponseUrl; // Tiendra l'url du png à afficher


    if (questionNum != "sessionName" && val) {
        reponseUrl = "assets/true.png";
    } else if (questionNum != "sessionName" && !val) {
        reponseUrl = "assets/false.png";
    }

    switch (questionNum) {
        case 'sessionName':
            $('input[name="name"]').val(val);
            $("#session_name").append(val);
            break;
        case 1:
            $('input[name="q1"]').val(val);
            $('#r1').append('<img src="' + reponseUrl + '">');
            break;
        case 2:
            $('input[name="q2"]').val(val);
            $('#r2').append('<img src="' + reponseUrl + '">');
            break;
        case 3:
            $('input[name="q3"]').val(val);
            $('#r3').append('<img src="' + reponseUrl + '">');
            break;
        case 4:
            $('input[name="q4"]').val(val);
            $('#r4').append('<img src="' + reponseUrl + '">');
            break;
        case 5:
            $('input[name="q5"]').val(val);
            $('#r5').append('<img src="' + reponseUrl + '">');
            break;
    }
}