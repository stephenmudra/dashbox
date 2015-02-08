/**
 * Created by stephenmudra on 18/01/15.
 */

'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher'),
    PayloadSources = require('constants/PayloadSources'),
    ActionTypes = require('constants/ActionTypes'),
    TrackStore = require('stores/TrackStore.js'),
    AlbumStore = require('stores/AlbumStore.js'),
    ArtistStore = require('stores/ArtistStore.js'),
    { createStore, mergeIntoBag, isInBag } = require('../utils/StoreUtils'),
    request = require('superagent');

var humps = require('humps'),
    normalizr = require('normalizr'),
    camelizeKeys = humps.camelizeKeys,
    Schema = normalizr.Schema,
    arrayOf = normalizr.arrayOf,
    normalize = normalizr.normalize;

var track = new Schema('tracks'),
    album = new Schema('albums'),
    artist = new Schema('artists');

track.define({
    album: album,
    artists: arrayOf(artist)
});

var _search = {},
    searchTimeout;

var SearchStore = createStore({
    contains(login, fields) {
        return isInBag(_search, login, fields);
    },

    get(query) {
        if (_search[query]) {
            return _search[query];
        }

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function () {
            request.get('https://api.spotify.com/v1/search?market=au&type=track&limit=50&q=' + encodeURIComponent(query), function (res) {
                if (!res.ok) {
                    console.log(res.text);

                    AppDispatcher.handleServerAction({
                        type: ActionTypes.REQUEST_SEARCH_ERROR,
                        query: query
                    });
                    return;
                }

                var parse = normalize(camelizeKeys(res.body.tracks), {
                    items: arrayOf(track)
                });

                AppDispatcher.handleServerAction({
                    type: ActionTypes.REQUEST_SEARCH_SUCCESS,
                    query: query,
                    entities: parse.entities,
                    result: parse.result
                });
            });
        }, 200);
    }
});

SearchStore.dispatchToken = AppDispatcher.register(function (payload) {
    AppDispatcher.waitFor([TrackStore.dispatchToken, AlbumStore.dispatchToken, ArtistStore.dispatchToken]);

    if (payload.source != PayloadSources.SERVER_ACTION) {
        return;
    }

    var action = payload.action;
    if (action.type == ActionTypes.REQUEST_SEARCH_SUCCESS) {
        _search[action.query] = action.result.items;
        SearchStore.emitChange();
    }
});

module.exports = SearchStore;