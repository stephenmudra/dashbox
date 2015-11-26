var React = require('react');
var request = require('superagent');


var SearchResults = require('views/searchResults.jsx');
var TrackQueue = require('views/trackQueue.jsx');

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

    clear: function() {
        this.setState({
            searchValue: ''
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
                {this.state.searchValue ? <span className="clearButton" onClick={this.clear}>x</span>: ''}
                {this.state.searchValue ? <SearchResults query={this.state.searchValue} />: ''}                
            </div>
        );
    }
});

module.exports = Content;
