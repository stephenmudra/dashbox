
var request = require('request'),
    async = require('async');

var humps = require('humps'),
    normalizr = require('normalizr'),
    camelizeKeys = humps.camelizeKeys,
    Schema = normalizr.Schema,
    arrayOf = normalizr.arrayOf,
    normalize = normalizr.normalize;

var trackSchema = new Schema('tracks'),
    albumSchema = new Schema('albums'),
    artistSchema = new Schema('artists'),
    queueSchema = new Schema('queue');

trackSchema.define({
    album: albumSchema,
    artists: arrayOf(artistSchema)
});

module.exports = function(req, res) {
    var db = req.db;

    var queue = db.get('queue'),
        songs = db.get('songs');

    queue.find({}, function (err, doc) {
        if (err) throw err;

        var parse = normalize(camelizeKeys(doc), arrayOf(queueSchema));

        songs.find({
            id: { $in: parse.result }
        }, function (err, doc) {
            if (err) throw err;

            var temp = normalize(camelizeKeys(doc), arrayOf(trackSchema));

            res.json({
                queue: parse.entities.queue,
                tracks: temp.entities.tracks,
                artists: temp.entities.artists,
                albums: temp.entities.albums,
            });
        });
    });
};
