
var Mopidy = require('mopidy');
var async = require('async');

var mopidy = new Mopidy({
    webSocketUrl: "ws://localhost:6680/mopidy/ws/",
    callingConvention: "by-position-or-by-name"
});

var db = require('monk')('mongodb://localhost:27017/dashbox');
var queue = db.get('queue');

var ready = false;

var _refreshQueue = function () {
    queue.find({}, function (err, sorted) {
        if (err) throw err;

        sorted.sort(function(a, b) {
            var aVotes = a.votes ? a.votes.length : 0,
                bVotes = b.votes ? b.votes.length : 0;

            if (aVotes != bVotes) {
                return bVotes - aVotes;
            } else {
                return new Date(a.modified) - new Date(b.modified);
            }
        });

        if (sorted.length == 0) {
            return;
        }

        mopidy.tracklist.add({"uri": 'spotify:track:' + sorted[0].id}).then(function (data) {
            mopidy.playback.getState({}).then(function (data) {
                if (data == 'stopped') {
                    mopidy.playback.play({});
                }
            });
        });
    });
};

mopidy.on("state:online", function () {
    ready = true;
    //mopidy.on(console.log.bind(console));
    //mopidy.tracklist.clear({}).then(function (data) {
        _refreshQueue();
    //});

    mopidy.on('event:trackPlaybackStarted', function (evt) {
        queue.findOne({
            id: evt.tl_track.track.uri.split(':')[2]
        }, function (err, doc) {
            console.log(doc);
            queue.updateById(doc._id, {
                "$set": {
                    "votes": [],
                    "modified": new Date()
                }
            }, function () {
                //_refreshQueue();
            });
        });
    });

    mopidy.on('event:trackPlaybackEnded', function (evt) {
        mopidy.tracklist.clear({}).then(function(data) {
            _refreshQueue();
        });
    });
});

module.exports = {
    refreshQueue: function () {
        if (ready) {
           // _refreshQueue();
        }
    },
    currentTrack: function (cb) {
        if (ready) {
            mopidy.playback.getCurrentTrack({}).then(function(track){
                mopidy.playback.getTimePosition({}).then(function(position){
                    cb({
                        track: track,
                        position: position
                    });
                });
            });
        }
    }
}