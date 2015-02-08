/*
0AEP7edFKCUwm0vtNHkzsS
0AvbvvHAZ8SQzLQdulzDfE
*/
/** @jsx React.DOM */
var React = require('react');

require('./searchResults.scss');

var createStoreMixin = require('utils/createStoreMixin.js');

var ResultsItem = require('components/TrackRow.jsx');
var MagicMove = require('react-magic-move');

var QueueStore = require('stores/QueueStore.js'),
    QueueActions = require('actions/QueueActions.js');

var TrackQueue = React.createClass({
    mixins: [createStoreMixin(QueueStore)],

    getStateFromStores(props) {
        return {
            queue: QueueStore.getSorted()
        };
    },

    componentDidMount() {
        QueueActions.loadQueue();
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.query !== this.props.query) {
            this.setState(this.getStateFromStores(nextProps));
            QueueActions.loadQueue();
        }
    },

    render() {
        return (
            <div id="search-results">
                {this.state.queue.map(function(result) {
                    return <ResultsItem key={result.id} id={result.id} showVotes={true} />;
                })}
            </div>
        );
    }
});


module.exports = TrackQueue;