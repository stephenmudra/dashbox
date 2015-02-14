'use strict';

var keyMirror = require('react/lib/keyMirror');

module.exports = keyMirror({
    REQUEST_TRACK: null,
    REQUEST_TRACK_SUCCESS: null,
    REQUEST_TRACK_ERROR: null,

    REQUEST_SEARCH: null,
    REQUEST_SEARCH_SUCCESS: null,
    REQUEST_SEARCH_ERROR: null,

    REQUEST_QUEUE: null,
    REQUEST_QUEUE_SUCCESS: null,
    REQUEST_QUEUE_ERROR: null,

    VOTE_TRACK_ERROR: null,
    VOTE_TRACK_SUCCESS: null,

    REQUEST_USER_ERROR: null,
    REQUEST_USER_SUCCESS: null,

    TRACK_CHANGE: null,
    TRACK_POSITION: null,

    ENTITIES_UPDATE: null,
    RELATED_TRACKS: null,

    WAVEFORM_DATA: null
});