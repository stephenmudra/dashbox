/**
 * Created by stephenmudra on 18/01/15.
 */

'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher'),
    PayloadSources = require('constants/PayloadSources'),
    { createStore, mergeIntoBag, isInBag } = require('../utils/StoreUtils');

var _artists = {};

var ArtistStore = createStore({
    contains(track, fields) {
        return isInBag(_artists, track, fields);
    },

    get(query) {
        return _artists[query];
    }
});

ArtistStore.dispatchToken = AppDispatcher.register(function (payload) {
    if (payload.source != PayloadSources.SERVER_ACTION) {
        return;
    }

    var action = payload.action,
        entities = action && action.entities,
        fetchedArtists = entities && entities.artists;

    if (fetchedArtists) {
        mergeIntoBag(_artists, fetchedArtists);
        ArtistStore.emitChange();
    }
});

module.exports = ArtistStore;
