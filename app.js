

var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var request = require('superagent');

var mopidy = require('./lib/mopidy.js');

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
var db = require('monk')('mongodb://localhost:27017/dashbox');
app.set('monk songs', db.get('songs'));
app.set('monk queue', db.get('queue'));

var echo = require('echojs')({key: 'VSTKDWGAO7VQD9NU8'});
//var tracklist = require('./tracklist.js');
app.use(function(req, res, next){
    req.db = db;
    req.echo = echo;
    //req.tracklist = tracklist;

    next();
});

var router = express.Router();

router.get('/', function(req, res) {
    res.render('index', { title: 'Main' });
});


//router.get('/queue', require('./routes/queue'));
//router.get('/vote', require('./routes/vote'));
//router.get('/user', require('./routes/user'));
//router.get('/playing', require('./routes/playing'));

app.use('/', router);
var formatter = require('./lib/formatter.js');
var showQueue = function (done) {
    db.get('queue').find({}, function (err, doc) {
        if (err) throw err;

        done(formatter.formatQueue(doc));
    });
};

var loadRelated = function (track, socket) {
    echo('playlist/static').get({
        track_id: 'spotify:track:' + track,
        type: 'song-radio',
        results: 50,
        bucket: ['id:spotify', 'tracks'],
        limit: true
    }, function (err, json) {
        if (err || !json.response || !json.response.songs) {
            return;
        }

        var ids = [];
        for (var i = 0, len = json.response.songs.length; i < len; i++) {
            ids.push(json.response.songs[i].tracks[0].foreign_id.split(':')[2]);
        }

        request.get('https://api.spotify.com/v1/tracks?ids=' + ids.join(','), function (res) {
            if (res.ok) {
                var result = [];
                for (var i = 0, len = res.body.tracks.length; i < len; i++) {
                    if (res.body.tracks[i].available_markets.indexOf('AU') !== -1) {
                        result.push(res.body.tracks[i]);
                    }
                }

                socket.emit('relatedTracks', formatter.formatTracks(result));
            }
        });
    });
};

var vote = require('./lib/vote.js');

mopidy.once('state:online', function () {
    io.on('connection', function (socket) {
        var socketId = socket.id
        var clientIp = socket.request.connection.remoteAddress

        console.log(socketId + '] a user connected ' + clientIp);

        mopidy.getCurrentPosition(function (data) {
            socket.emit('currentPosition', data);
        });

        mopidy.getCurrentTrack(function (data) {
            socket.emit('currentTrack', { id: data });

            loadRelated(data, socket);

            mopidy.loadAudioAnalysis('spotify:track:' + data, function (data) {
                io.emit('waveformData', {
                    id: data.id,
                    track: data.track,
                    segments: data.segments
                });
            });
        });

        socket.emit('user', {
            hash: crypto.createHash('md5').update(clientIp).digest('hex')
        });

        showQueue(function (queue) {
            db.get('songs').find({
                id: { $in: queue.result }
            }, function (err, doc) {
                if (err) throw err;

                var temp = formatter.formatTracks(doc);

                socket.emit('entities', {
                    queue: queue.entities.queue,
                    tracks: temp.entities.tracks,
                    artists: temp.entities.artists,
                    albums: temp.entities.albums
                });
            });
        });

        var voteHandler = vote(db, clientIp);
        socket.on('vote', function (data) {
            voteHandler(data.track, function (queue) {
                io.emit('entities', {
                    queue: queue
                });

                mopidy.loadQueue(function (list) {
                    mopidy.setNextTrack('spotify:track:' + list[0].id, function () {

                    });
                });
            });
        });
    });

    setInterval(function () {
        mopidy.getCurrentPosition(function (data) {
            io.emit('currentPosition', data);
        });
    }, 30000);


    mopidy.on('dash:nextTrack', function (doc) {
        io.emit('currentTrack', doc);

        mopidy.getCurrentPosition(function (data) {
            io.emit('currentPosition', data);
        });

        showQueue(function (queue) {
            io.emit('entities', {
                queue: queue.entities.queue
            });
        });

        loadRelated(doc.id, io);

        mopidy.loadAudioAnalysis('spotify:track:' + doc.id, function (data) {
            io.emit('waveformData', {
                id: data.id,
                track: data.track,
                segments: data.segments
            });
        });
    });
});

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = http;


/*var coreAudio = require("node-core-audio");
var engine = coreAudio.createNewAudioEngine();
var _buffer = null;
function processAudio( buffer ) {
    _buffer = buffer;
}
engine.addAudioCallback( processAudio );


setInterval(function () {
    io.emit('waveformData', _buffer[0]);
}, 100);*/
