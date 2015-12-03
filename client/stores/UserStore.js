/**
 * Created by stephenmudra on 18/01/15.
 */

'use strict';

var AppDispatcher = require('dispatcher/AppDispatcher'),
    { createStore, mergeIntoBag, isInBag } = require('utils/StoreUtils'),
    request = require('superagent');

var _user = {};

var UserStore = createStore({
    get() {
        return _user;
    }
});

UserStore.dispatchToken = AppDispatcher.register(function (payload) {
    var action = payload.action,
        entities = action && action.entities,
        response = entities && entities.user;

    if (response) {
        _user = response;
        UserStore.emitChange();
    }
});

module.exports = UserStore;