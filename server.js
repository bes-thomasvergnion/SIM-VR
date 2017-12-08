var fs = require('fs'),
    http = require('http'),
    path = require('path'),
    express = require('express'),
    bodyParser = require("body-parser");


var app = express();
const MongoClient = require('mongodb').MongoClient;

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


var server = http.Server(app);


var io = require('socket.io')(server);

var db;
MongoClient.connect('mongodb://127.0.0.1:27017/vr', (err, database) => {
    if (err) return console.log(err)
    db = database
    server.listen(8000, () => {
        console.log('Server running on port ------------>>> 8000')
    })
})



//ROUTES

app.get('/', function(req, res) {
    res.header('Content-type', 'text/html');
    return res.render('index');
});

app.get('/console', (req, res) => {
    db.collection('logs').find().sort({ $natural: -1 }).toArray((err, result) => {
        console.log(result);
        if (err) return console.log(err)
        res.render('console.ejs', { logs: result })
    })
})

app.get('/control', function(req, res) {
    res.header('Content-type', 'text/html');
    return res.render('control');
});


app.get('/client', function(req, res) {
    res.header('Content-type', 'text/html');
    return res.render('client');
});


app.post('/save_results', function(req, res) {
    // Insert document in collection
    db.collection('logs').insert(req.body, function(err, doc) {

        if (err) throw err;
        //Doc saved
        console.log('DOCUMENT SAVED');

    });
    db.collection('logs').find().sort({ $natural: -1 }).toArray((err, result) => {
        console.log(result);
        if (err) return console.log(err)
        res.render('console.ejs', { logs: result })
    })
});



app.get('/logs', (req, res) => {
    db.collection('logs').find().sort({ $natural: -1 }).toArray((err, result) => {
        console.log(result);
        if (err) return console.log(err)
        res.render('logs.ejs', { logs: result })
    })
})




/*********************** 
 *                     *
 *      SOCKET IO      *
 *                     *
 * *********************/





io.on('connection', function(socket) {
    console.log('CONNECTED')
    socket.on('fromClient', function(data) {
        io.emit('fromClient', data);
    });
    socket.on('fromConsole', function(data) {
        io.emit('fromConsole', data);
    });
    socket.on('fromControl', function(msg) {
        console.log('message fromControl: ' + msg);
        io.emit('fromControl', msg);
    });
    socket.on('toControl', function(msg) {
        console.log('message toControl: ' + msg);
        io.emit('toControl', msg);
    });
    socket.on('disconnect', function() {
        console.log('DISCONNECTED')
    })
});