
var request = require('superagent');
var crypto = require('crypto');

var addVote = function (req, res, doc) {
    var db = req.db;

    var queue = db.get('queue');

    var hash = crypto.createHash('md5').update(req.connection.remoteAddress).digest('hex');

    // Check if user has already voted
    var found = false;
    for (var i = 0, len = doc.votes.length; i < len; i++) {
        if (doc.votes[i].hash == hash) {
            found = true;
        }
    }

    // If not add vote.
    if (!found) {
        doc.modified = new Date();
        doc.votes.push({
            hash: hash,
            created: new Date()
        });
    } else {
        var temp = {};
        temp[doc.id] = doc;

        res.json({
            success: false,
            entities: {
                queue: temp
            }
        });

        return;
    }

    queue.updateById(doc._id, doc, function (err) {
        if (err) throw err;

        var temp = {};
        temp[doc.id] = doc;

        req.tracklist.refreshQueue();

        res.json({
            success: true,
            entities: {
                queue: temp
            }
        });
    });
};

var createQueue = function (req, res) {
    var db = req.db;

    var queue = db.get('queue');

    queue.insert({
        id: req.query.id,
        votes: []
    }, function (err, doc) {
        if (err) throw err;

        addVote(req, res, doc);
    });
};

var createSong = function (req, res) {
    var db = req.db;

    var queue = db.get('queue'),
        songs = db.get('songs');

    // Load from spotify
    request.get('https://api.spotify.com/v1/tracks/' + req.query.id, function (result) {
        if (!result.ok) {
            res.json({
                success: false,
                error: result.body.error
            });
            return;
        }

        songs.insert(result.body, function (err, doc) {
            if (err) throw err;

            createQueue(req, res);
        });
    });
};

module.exports = function(req, res) {
    var db = req.db;

    var queue = db.get('queue'),
        songs = db.get('songs');

    queue.findOne({
        id: req.query.id
    }, function (err, doc) {
        if (err) throw err;

        if (doc) {
            addVote(req, res, doc);
            return;
        }

        songs.findOne({
           id: req.query.id
        }, function (err, doc) {
            if (err) throw err;

            if (doc) {
                createQueue(req, res);
            } else {
                createSong(req, res);
            }
        });
    });
};
