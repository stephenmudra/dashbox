/**
 * Created by stephenmudra on 18/01/15.
 */

'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher'),
    PayloadSources = require('constants/PayloadSources'),
    AlbumStore = require('stores/AlbumStore.js'),
    ArtistStore = require('stores/ArtistStore.js'),
    { createStore, mergeIntoBag, isInBag } = require('../utils/StoreUtils');

var _tracks = {};

var TrackStore = createStore({
    contains(track, fields) {
        return isInBag(_tracks, track, fields);
    },

    get(query) {
        return _tracks[query];
    }
});

TrackStore.dispatchToken = AppDispatcher.register(function (payload) {
    AppDispatcher.waitFor([AlbumStore.dispatchToken, ArtistStore.dispatchToken]);

    if (payload.source != PayloadSources.SERVER_ACTION) {
        return;
    }

    var action = payload.action,
        entities = action && action.entities,
        fetchedTracks = entities && entities.tracks;

    if (fetchedTracks) {
        mergeIntoBag(_tracks, fetchedTracks);
        TrackStore.emitChange();
    }
});

module.exports = TrackStore;