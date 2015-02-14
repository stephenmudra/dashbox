

var Mopidy = require('mopidy'),
    _ = require('lodash'),
    request = require('superagent');

var echo = require('echojs')({key: 'VSTKDWGAO7VQD9NU8'});

var db = require('monk')('mongodb://localhost:27017/dashbox'),
    songs = db.get('songs'),
    queue = db.get('queue'),
    analysis = db.get('analysis');

mopidy = _.assign(new Mopidy({
    webSocketUrl: "ws://localhost:6680/mopidy/ws/"
}), {
    loadAudioAnalysis: function (track, done) {
        done = done || function () {};

        console.log('analysis: ' + track);
        analysis.findOne({
            uri: track
        }, function (err, doc) {
            if (err) {
                return;
            }

            if (doc) {
                done(doc);
                return;
            }

            echo('song/profile').get({
                track_id: track,
                bucket: ['id:spotify', 'audio_summary']
            }, function (err, json) {
                if (err || !json.response || !json.response.songs) {
                    return;
                }

                request.get(json.response.songs[0].audio_summary.analysis_url, function (response) {
                    console.log(response.ok);
                    if (response.ok && response.body && response.body.segments) {
                        response.body.uri = track;
                        response.body.id = track.split(':')[2];

                        analysis.findOne({
                            uri: track
                        }, function (err, doc) {
                            if (!doc) {
                                analysis.insert(response.body, function (err, doc) {
                                    done(doc);
                                });
                            } else {
                                done(doc);
                            }
                        });
                    }
                });
            });
        });
    },

    clear: function(done) {
        var gotCurrentTrack, gotIndex, gotPrevious, gotTracks, onError, onRemove, s;
        s = {};
        onError = function(err) {
            done(err);
            s = null;
        };
        gotCurrentTrack = function(tlTrack) {
            if (tlTrack) {
                mopidy.tracklist.index(tlTrack).then(gotIndex, onError);
            } else {
                gotPrevious([]);
            }
        };
        gotIndex = function(index) {
            s.current = index;
            if (0 >= index) {
                gotPrevious([]);
            } else {
                mopidy.tracklist.slice(0, index).then(gotPrevious, onError);
            }
        };
        gotPrevious = function(tlTracks) {
            s.previous = tlTracks;
            mopidy.tracklist.slice(s.current + 1, Infinity).then(gotTracks, onError);
        };
        gotTracks = function(tracks) {
            var ids, track;
            tracks || (tracks = []);
            tracks.push.apply(tracks, s.previous);
            ids = (function() {
                var _i, _len, _results;
                _results = [];
                for (_i = 0, _len = tracks.length; _i < _len; _i++) {
                    track = tracks[_i];
                    _results.push(track.tlid);
                }
                return _results;
            })();
            mopidy.tracklist.remove({
                tlid: ids
            }).then(onRemove, onError);
            s = ids = tracks = null;
        };
        onRemove = function() {
            return done();
        };
        return mopidy.playback.getCurrentTlTrack().then(gotCurrentTrack, onError);
    },

    setNextTrack: function(track, done) {
        var onAdd, onClear, onError;
        onError = function(err) {
            return done(err);
        };

        onClear = function(err) {
            if (err) {
                return done(err);
            }
            mopidy.tracklist.add(null, null, track).then(onAdd, onError);
        };
        onAdd = function() {
            return done();
        };

        mopidy.clear(onClear);
        this.loadAudioAnalysis(track);
    },

    loadQueue: function (done) {
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

            done(sorted);
        });
    },

    getCurrentTrack: function (done) {
        mopidy.playback.getCurrentTrack().then(function(track) {
            if (track) {
                done(track.uri.split(':')[2]);
            }
        });
    },

    getCurrentPosition: function (done) {
        mopidy.playback.getCurrentTrack().then(function(track) {
            if (track) {
                mopidy.playback.getTimePosition().then(function(position) {
                    done({
                        duration: track.length,
                        position: position
                    });
                });
            }
        });
    }
});

mopidy.once('state:online', function () {
    mopidy.on('event:trackPlaybackStarted', function (evt) {
        queue.findOne({
            id: evt.tl_track.track.uri.split(':')[2]
        }, function (err, doc) {
            queue.updateById(doc._id, {
                "$set": {
                    "votes": [],
                    "modified": new Date()
                }
            }, function () {
                mopidy.loadQueue(function (list) {
                    mopidy.setNextTrack('spotify:track:' + list[0].id, function () {
                        mopidy.emit('dash:nextTrack', doc);
                    });
                });
            });
        });

    });

    //mopidy.tracklist.clear();
    mopidy.tracklist.setConsume(true);
    mopidy.tracklist.setRandom(false);
    mopidy.tracklist.setRepeat(false);
    mopidy.tracklist.setSingle(false);
    //mopidy.playback.stop();


    mopidy.loadQueue(function (list) {
        mopidy.setNextTrack('spotify:track:' + list[0].id, function () {
            mopidy.playback.getState().then(function (data) {
                if (data == 'stopped') {
                    mopidy.playback.play();
                }
            });
        });
    });
});


module.exports = mopidy;