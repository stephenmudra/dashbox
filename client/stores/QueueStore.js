/**
 * Created by stephenmudra on 18/01/15.
 */

'use strict';

var AppDispatcher = require('dispatcher/AppDispatcher'),
    PayloadSources = require('constants/PayloadSources'),
    ActionTypes = require('constants/ActionTypes.js'),
    { createStore, mergeIntoBag, isInBag } = require('utils/StoreUtils'),
    request = require('superagent');

var _queue = {};

var QueueStore = createStore({
    contains(track, fields) {
        return isInBag(_queue, track, fields);
    },

    get(query) {
        return _queue[query];
    },

    loadQueue() {
        request.get('/api/queue', function (err, res) {
            if (!res.ok) {
                console.log(res.text);

                AppDispatcher.handleServerAction({
                    type: ActionTypes.REQUEST_QUEUE_ERROR
                });
                return;
            }

            AppDispatcher.handleServerAction({
                type: ActionTypes.REQUEST_QUEUE_SUCCESS,
                entities: res.body
            });
        });
    },

    getSorted() {
        var sorted = [];

        for (var item in _queue) {
            if (_queue.hasOwnProperty(item)) {
                sorted.push(_queue[item]);
            }
        }

        sorted.sort(function(a, b) {
            var aVotes = a.votes ? a.votes.length : 0,
                bVotes = b.votes ? b.votes.length : 0;

            if (aVotes != bVotes) {
                return bVotes - aVotes;
            } else {
                return new Date(a.lastVote) - new Date(b.lastVote);
            }
        });

        return sorted;
    },

    getRecent() {
        var sorted = [];

        for (var item in _queue) {
            if (_queue.hasOwnProperty(item)) {
                sorted.push(_queue[item]);
            }
        }

        sorted.sort(function(a, b) {
            return new Date(b.lastVote) - new Date(a.lastVote);
        });

        return sorted;
    }
});

QueueStore.dispatchToken = AppDispatcher.register(function (payload) {
    var action = payload.action,
        entities = action && action.entities,
        fetchedQueue = entities && entities.queue;

    if (fetchedQueue) {
        var transform = (x) => x;

        for (var key in fetchedQueue) {
            if (!fetchedQueue.hasOwnProperty(key)) {
                continue;
            }

            var trackId = fetchedQueue[key].link.split(':');
            trackId = trackId[trackId.length - 1];

            _queue[trackId] = transform(fetchedQueue[key]);
        }

        QueueStore.emitChange();
    }
});


module.exports = QueueStore;
