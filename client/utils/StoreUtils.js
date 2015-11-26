'use strict';

var _ = require('lodash'), 
    { EventEmitter } = require('events'),
    CHANGE_EVENT = 'change';

var StoreUtils = {
    createStore(spec) {
        var store = _.assign({
            emitChange() {
                this.emit(CHANGE_EVENT);
            },

            addChangeListener(callback) {
                this.on(CHANGE_EVENT, callback);
            },

            removeChangeListener(callback) {
                this.removeListener(CHANGE_EVENT, callback);
            }
        }, spec, EventEmitter.prototype);

        _.each(store, function (val, key) {
            if (_.isFunction(val)) {
                store[key] = store[key].bind(store);
            }
        });

        store.setMaxListeners(0);
        return store;
    },

    isInBag(bag, id, fields) {
        var item = bag[id];
        if (!bag[id]) {
            return false;
        }

        if (fields) {
            return fields.every(field => item.hasOwnProperty(field));
        } else {
            return true;
        }
    },

    mergeIntoBag(bag, entities, transform) {
        if (!transform) {
            transform = (x) => x;
        }

        for (var key in entities) {
            if (!entities.hasOwnProperty(key)) {
                continue;
            }

            if (!bag.hasOwnProperty(key)) {
                bag[key] = transform(entities[key]);
            } else if (bag[key] != entities[key]) {
                bag[key] = transform(_.assign({}, bag[key], entities[key]));
            }
        }
    }
};

module.exports = StoreUtils;
