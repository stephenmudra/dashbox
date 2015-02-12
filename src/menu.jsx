/** @jsx React.DOM */
    
var React = require('react');

require('./menu.scss');

var createStoreMixin = require('utils/createStoreMixin.js');
var QueueStore = require('stores/QueueStore.js');
var ResultsItem = require('components/TrackRow.jsx');


var Menu = React.createClass({
    mixins: [createStoreMixin(QueueStore)],

    getStateFromStores(props) {
        return {
            queue: QueueStore.getRecent()
        };
    },

    renderList() {
        var recent = this.state.queue.slice(0, 15);

        return recent.map(function(result) {
            return <ResultsItem key={result.id + result.hash} id={result.id} />;
        });
    },

    render() {
        return (
            <div id="menu">
                <div className="list-todos">
                    <div className='header'>Recent Votes</div>
                    {this.renderList()}
                </div>
            </div>
        );
    }
});

module.exports = Menu;