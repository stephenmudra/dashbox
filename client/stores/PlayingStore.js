/**
 * Created by stephenmudra on 18/01/15.
 */

'use strict';

var AppDispatcher = require('dispatcher/AppDispatcher'),
    { createStore, mergeIntoBag, isInBag } = require('utils/StoreUtils'),
    request = require('superagent');

var _playing = {};

var PlayingStore = createStore({
    get() {
        return _playing;
    }
});

PlayingStore.dispatchToken = AppDispatcher.register(function (payload) {
    var action = payload.action,
        entities = action && action.entities,
        response = entities && entities.playing;

    if (response) {
        _playing.track = response;

        /*if (response.currentPosition) {
            _playing.currentPosition = response.currentPosition;
            _playing.currentTime = new Date().getTime();
        }

        if (response.track) {
            _playing.track = response.track;
        }

        if (response.votes) {
            _playing.votes = response.votes;
        }

        if (response.related) {
            _playing.related = response.related;
        }*/

        PlayingStore.emitChange();
    }
});

module.exports = PlayingStore;