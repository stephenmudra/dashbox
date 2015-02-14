/**
 * Created by stephenmudra on 18/01/15.
 */


var AppDispatcher = require('dispatcher/AppDispatcher'),
    PayloadSources = require('constants/PayloadSources'),
    { createStore, mergeIntoBag, isInBag } = require('utils/StoreUtils');

var _albums = {};

var AlbumStore = createStore({
    contains(track, fields) {
        return isInBag(_albums, track, fields);
    },

    get(query) {
        return _albums[query];
    }
});

AlbumStore.dispatchToken = AppDispatcher.register(function (payload) {
    if (payload.source != PayloadSources.SERVER_ACTION) {
        return;
    }

    var action = payload.action,
        entities = action && action.entities,
        fetchedAlbums = entities && entities.albums;

    if (fetchedAlbums) {
        mergeIntoBag(_albums, fetchedAlbums);
        AlbumStore.emitChange();
    }
});

module.exports = AlbumStore;
