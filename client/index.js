
var React = require('react');
var ReactDOM = require('react-dom');

var Root = require('./views/Root.jsx');

import 'assets/scss/styles.scss';

var AppDispatcher = require('./dispatcher/AppDispatcher'),
    ActionTypes = require('./constants/ActionTypes');

ReactDOM.render(
    <Root />,
    document.getElementById("app")
);



