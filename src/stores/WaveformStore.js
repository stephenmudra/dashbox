/**
 * Created by stephenmudra on 24/01/15.
 */
/**
 * Created by stephenmudra on 18/01/15.
 */

'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher'),
    { createStore, mergeIntoBag, isInBag } = require('../utils/StoreUtils'),
    request = require('superagent');

var _waveform = {};

var WaveFormStore = createStore({
    get() {
        return _waveform;
    }
});

WaveFormStore.dispatchToken = AppDispatcher.register(function (payload) {
    var action = payload.action,
        response = action.waveform;

    if (response) {
        _waveform = response;
        WaveFormStore.emitChange();
    }
});

module.exports = WaveFormStore;