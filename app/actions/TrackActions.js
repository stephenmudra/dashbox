/**
 * Created by stephenmudra on 18/01/15.
 */
'use strict';

var AppDispatcher = require('dispatcher/AppDispatcher'),
    ActionTypes = require('constants/ActionTypes'),
    SearchStore = require('stores/SearchStore.js'),
    TrackStore = require('stores/TrackStore.js'),
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

var search = '',
    searchTimeout = null;

var TrackActions = {
    loadTrack (trackId) {
        if (TrackStore.contains(trackId)) {
            return;
        }

        /*AppDispatcher.handleViewAction({
            type: ActionTypes.REQUEST_TRACK,
            query: trackId
        });*/

        request.get('https://api.spotify.com/v1/tracks?ids=' + trackId, function (res) {
            if (!res.ok) {
                console.log(res.text);

                AppDispatcher.handleServerAction({
                    type: ActionTypes.REQUEST_TRACK_ERROR,
                    query: trackId
                });
                return;
            }

            var parse = normalize(camelizeKeys(res.body), {
                tracks: arrayOf(track)
            });

            AppDispatcher.handleServerAction({
                type: ActionTypes.REQUEST_TRACK_SUCCESS,
                query: trackId,
                entities: parse.entities,
                result: parse.result
            });
        });
    },

    searchTracks (query) {
        if (SearchStore.contains(query)) {
            return;
        }

        search = query;

        if (searchTimeout == null) {
            searchTimeout = setTimeout(function () {
                query = search;
                searchTimeout = null;
                request.get('https://api.spotify.com/v1/search?market=au&type=track&limit=50&q=' + encodeURIComponent(search), function (res) {
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
            }, 500);
        }

        /*AppDispatcher.handleViewAction({
            type: ActionTypes.REQUEST_SEARCH,
            query: query
        });*/

    }
};

module.exports = TrackActions;