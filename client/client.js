/** @jsx React.DOM */

var React = require('react');

var AppDispatcher = require('./dispatcher/AppDispatcher'),
    ActionTypes = require('./constants/ActionTypes');

var socket = require('socket.io-client')(window.location.hostname+':3000');

socket.on('currentPosition', function(data){
    AppDispatcher.handleServerAction({
        type: ActionTypes.TRACK_POSITION,
        playing: {
            currentPosition: data
        }
    });
});

socket.on('currentTrack', function(data){
    AppDispatcher.handleServerAction({
        type: ActionTypes.TRACK_CHANGE,
        playing: {
            track: data.id,
            votes: data.votes
        }
    });
});

function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

socket.on('relatedTracks', function (data) {
    console.log(data);

    AppDispatcher.handleServerAction({
        type: ActionTypes.RELATED_TRACKS,
        playing: {
            related: shuffle(data.result)
        },
        entities: data.entities
    });
});

socket.on('user', function(data){
    AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_USER_SUCCESS,
        user: data
    });
});

socket.on('entities', function (data) {
    AppDispatcher.handleServerAction({
        type: ActionTypes.ENTITIES_UPDATE,
        entities: data
    });
});

socket.on('waveformData', function (data) {
    AppDispatcher.handleServerAction({
        type: ActionTypes.WAVEFORM_DATA,
        waveform: data
    });
});

AppDispatcher.register(function (payload) {
    var action = payload.action;

    if (action && action.type == ActionTypes.VOTE_TRACK_SUCCESS) {
        socket.emit('vote', {
            track: action.track
        });
    }
});


var Root = require('./views/Root.jsx');

React.render(
    <Root />,
    document.getElementById("app")
);



