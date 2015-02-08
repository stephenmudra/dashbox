/** @jsx React.DOM */
var React = require('react');

require('./searchResults.scss');

var createStoreMixin = require('utils/createStoreMixin.js');

var ResultsItem = require('components/TrackRow.jsx');

var SearchStore = require('stores/SearchStore.js'),
    TrackActions = require('actions/TrackActions.js');

var SearchResults = React.createClass({
    mixins: [createStoreMixin(SearchStore)],

    getDefaultProps() {
        return {
            query: ""
        }
    },

    getStateFromStores(props) {
        return {
            results: SearchStore.get(props.query)
        };
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.query !== this.props.query) {
            this.setState(this.getStateFromStores(nextProps));
        }
    },

    render() {
        if (this.state.results === undefined) {
            return (
                <div id="search-results">
                    <h1>Loading ...</h1>
                </div>)
        }

        if (this.state.results.length === 0) {
            return (
                <div id="search-results">
                    <h1>No Results Found</h1>
                </div>)
        }

        return (
            <div id="search-results">
                {this.state.results.map(function(result) {
                    return <ResultsItem key={result} id={result} />;
                })}
            </div>
        );
    }
});


module.exports = SearchResults;

