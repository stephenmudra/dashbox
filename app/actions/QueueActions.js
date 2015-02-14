/**
 * Created by stephenmudra on 18/01/15.
 */

var AppDispatcher = require('dispatcher/AppDispatcher'),
    ActionTypes = require('constants/ActionTypes'),
    request = require('superagent');


var _voting = [];


var QueueActions = {
    loadQueue () {
        /*AppDispatcher.handleViewAction({
            type: ActionTypes.REQUEST_QUEUE
        });*/

        /*request.get('/queue', function (res) {
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
        });*/
    },
    voteSong: function (track) {
        if (_voting.indexOf(track) !== -1) {
            return;
        }

        _voting.push(track);

        AppDispatcher.handleServerAction({
            type: ActionTypes.VOTE_TRACK_SUCCESS,
            track: track
        });
    }
};

module.exports = QueueActions;