//////////////////// quickfix pour un bug avec le plein écran ////////////////////




if (document.querySelector("a-scene").hasLoaded) {
    run();
} else {
    document.querySelector("a-scene").addEventListener("loaded", run);
}

function run() {
    document.querySelector("a-scene").querySelector(".a-enter-vr-button").addEventListener("click", function(e) {
        console.log("VR Mode entered");
        this.style.display = "none";
        document.getElementById("video").play();
        document.getElementById("video").pause();
    }, false);
}






//////////////////// Déclaration des variables ////////////////////





var scene = document.querySelector("a-scene");
var vid = document.querySelector('#video');
var mcq = document.querySelector('#mcq');

var sound = document.querySelector('#bip');
var answer = document.querySelector('#answer');

var splash = document.querySelector('#show_splash');
var splash_r = document.querySelector('#show_splash_r');
var finished = document.querySelector('#show_finished');

var heart_img_110 = document.querySelector('#heart_img_110');
var heart_img_120 = document.querySelector('#heart_img_120');
var heart_img_115 = document.querySelector('#heart_img_115');

var referenceTime = 0;
var questionIndex = 0;
var timeTrigger = 0;
var cycle = true; // true est le début du cycle, false la fin du cycle
var maxQcm = 5;
var result = false; // faux par défaut

var matrix = [
    [1, 20, 25, "-5 2.7 -6", "-10 25 0"],
    [0, 28, 33, "1 1.4 -7", "0 0 0", "#heart_img_110"],
    [1, 45, 50, "-3.5 3 -7", "0 20 0"],
    [0, 54, 59, "1 -1 -6", "-25 0 0", "#heart_img_120"],
    [2, 66, 73, "-3.5 0 -5", "-25 25 0", "#heart_img_115"]
];









//////////////////// Par sécurité ////////////////////





vid.pause();
vid.currentTime = 0;




//////////////////// Initialisation de socket.io ////////////////////






var socket = io();

socket.on('connect', function() {
    socket.on('fromConsole', function(msg) { //Socket écoute tout les messages de 'fromConsole'
        updateManager(msg); // Cette fonction va trier les messages reçu
    });
});





//////////////////// Update manager ////////////////////




var updateManager = function(msg) {
    switch (msg.event) {
        case 'SESSION_START':
            splash.setAttribute('visible', false);
            splash_r.setAttribute('visible', true);
            timeTrigger = matrix[questionIndex][1]; //Premiere valeure 
            break;

        case 'START':

            splash.setAttribute('visible', false);
            splash_r.setAttribute('visible', false);
            finished.setAttribute('visible', false);

            vid.play(); // Déclenche aussi ontimeupdate

            socket.emit('fromClient', { event: 'STARTED' });
            break;

        case 'PAUSE':

            vid.pause();
            break;

        case 'RESET':

            splash.setAttribute('visible', true);
            splash_r.setAttribute('visible', false);
            finished.setAttribute('visible', false);

            vid.currentTime = 0;
            referenceTime = 0;
            questionIndex = 0;
            timeTrigger = 0;
            cycle = true;
            break;

        case 'TRUE':

            result = true;
            break;

        case 'FALSE':

            break;

    }
};










//////////////////// Video update manager ////////////////////




// Quand la vidéo est en marche, cette fonction est déclenchée 
// a chaque fois que la vidéo change de durée.

vid.ontimeupdate = function() {
    var vidTime = Math.round(vid.currentTime);
    if (questionIndex < maxQcm) { // Limite au nombre de QCM
        if (vidTime != referenceTime) { // Une seule déclenche par seconde
            videoUpdateManager(vidTime);
            referenceTime = vidTime;
        }
    }
};



var videoUpdateManager = function(vidTime) {

    // mise a jour du compteur sur la console via socket toute les secondes
    socket.emit('fromClient', { event: 'TIMEUPDATE', data: vid.currentTime });
    if (vidTime === timeTrigger) { // Le cycle de réponse est déclenché       
        sound.play();
        cycleRoutine();
    }
}


var cycleRoutine = function() {

    if (cycle) { // début du cycle

        socket.emit('fromClient', { event: 'BEGIN', data: vid.currentTime }); // On active les boutons de validation sur la console        


        mcq.setAttribute('position', matrix[questionIndex][3]); //On modifie la position de la fenetre de reponse
        mcq.setAttribute('rotation', matrix[questionIndex][4]); //On modifie la rotation de la fenetre de reponse
        mcq.setAttribute('visible', true); //On rend visible la fenetre de reponse

        if (matrix[questionIndex][5]) { // Si il y a un coeur present sur ce QCM on le rend visible
            document.querySelector(matrix[(questionIndex)][5]).setAttribute('visible', true);
        }

        timeTrigger = matrix[questionIndex][2]; //On modifie la déclenche pour la fin du cycle
        cycle = false; // Prochaine fois on sera à la fin

    } else { // Déclenche de fin

        socket.emit('fromClient', { event: 'END', data: vid.currentTime }); // On désactive les boutons de validation sur la console        

        mcq.setAttribute('visible', false); //On rend invisible la fenetre de reponse
        interpretResults(result); // Interprete les resultats

        if (matrix[questionIndex][5]) { // Si il y a un coeur present pour ce QCM
            document.querySelector(matrix[questionIndex][5]).setAttribute('visible', false); // On le rend invisible 
        }

        timeTrigger = matrix[questionIndex + 1][1]; // On modifie la déclenche pour le début de la prochaine question
        result = false; // Faux par défaut
        cycle = true; // Prochaine fois on sera au début
        questionIndex++; // On modifie l'index du QCM
    }
}



var interpretResults = function(solution) {
    if (solution) {
        answer.setAttribute('src', '#true')
        answer.emit('anim');
        socket.emit('fromClient', { event: 'MCQ', mcq_num: questionIndex, data: true });
        return true;
    } else { //wrong answer
        answer.setAttribute('src', '#false')
        answer.emit('anim');
        socket.emit('fromClient', { event: 'MCQ', mcq_num: questionIndex, data: false });
        return false;
    }
}








//////////////////// Video est terminée ////////////////////


vid.onended = function() {
    socket.emit('fromClient', { event: 'ONENDED', data: vid.currentTime });
    finished.setAttribute('visible', true);
};