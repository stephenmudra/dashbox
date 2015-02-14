/**
 * Created by stephenmudra on 24/01/15.
 */

var request = require('superagent');
var crypto = require('crypto');

module.exports = function(db, clientIp) {
    var queue = db.get('queue'),
        songs = db.get('songs');

    var addVote = function (doc, done) {
        var hash = crypto.createHash('md5').update('' + clientIp).digest('hex');

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
            return;
        }

        queue.updateById(doc._id, doc, function (err) {
            if (err) throw err;

            var temp = {};
            temp[doc.id] = doc;

            // req.tracklist.refreshQueue();

            done(temp);
        });
    };

    var createQueue = function (track, done) {
        queue.insert({
            id: track,
            votes: []
        }, function (err, doc) {
            if (err) throw err;

            addVote(doc, done);
        });
    };

    var createSong = function (track, done) {
        // Load from spotify
        request.get('https://api.spotify.com/v1/tracks/' + track, function (result) {
            if (!result.ok) {
                return;
            }

            songs.insert(result.body, function (err) {
                if (err) throw err;

                createQueue(track, done);
            });
        });
    };

    return function (track, done) {
        queue.findOne({
            id: track
        }, function (err, doc) {
            if (err) throw err;

            if (doc) {
                addVote(doc, done);
                return;
            }

            songs.findOne({
                id: track
            }, function (err, doc) {
                if (err) throw err;

                if (doc) {
                    createQueue(track, done);
                } else {
                    createSong(track, done);
                }
            });
        });
    };
};
