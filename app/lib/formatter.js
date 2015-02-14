/**
 * Created by stephenmudra on 24/01/15.
 */

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

module.exports = {
    formatTrack: function (track) {
        return normalize(camelizeKeys(track), arrayOf(trackSchema));
    },
    formatTracks: function (track) {
        return normalize(camelizeKeys(track), arrayOf(trackSchema));
    },
    formatQueue: function (queue) {
        return normalize(camelizeKeys(queue), arrayOf(queueSchema));
    }
};
