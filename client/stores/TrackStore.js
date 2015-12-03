

import AppDispatcher from '../dispatcher/AppDispatcher';
import PayloadSources from '../constants/PayloadSources';
import AlbumStore from '../stores/AlbumStore.js';
import ArtistStore from '../stores/ArtistStore.js';
import { createStore, mergeIntoBag, isInBag } from '../utils/StoreUtils';

import TrackActions from '../actions/TrackActions.js';

var _tracks = {};

var TrackStore = createStore({
    contains(track, fields) {
        return isInBag(_tracks, track, fields);
    },

    get(query) {
        if (!query || typeof query != 'string') {
            return;
        }
        query = query.split(':');
        query = query[query.length - 1];

        TrackActions.loadTrack(query);
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

export default TrackStore;