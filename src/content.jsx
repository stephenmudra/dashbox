/** @jsx React.DOM */
var React = require('react');
var request = require('superagent');

require('./content.scss');

var SearchResults = require('./searchResults.jsx');
var TrackQueue = require('./trackQueue.jsx');

var ENTER_KEY_CODE = 13;

var Content = React.createClass({
    getInitialState: function () {
        return {
            searchValue: ""
        };
    },

    handleChange: function(evt) {
        this.setState({
            searchValue: evt.target.value
        });
    },

    keyDown: function(evt) {
        if (evt.keyCode === ENTER_KEY_CODE) {
            evt.target.blur();
        }
    },

    render: function() {
        return (
            <div id="content-container">
                <input className='searchBox' placeholder="Search" onChange={this.handleChange} onKeyDown={this.keyDown} value={this.state.searchValue} />
                {this.state.searchValue ? <SearchResults query={this.state.searchValue} /> : <TrackQueue />}
            </div>
        );
    }
});

module.exports = Content;
