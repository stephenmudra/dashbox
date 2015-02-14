/** @jsx React.DOM */
    
var React = require('react');

var createStoreMixin = require('utils/createStoreMixin.js');

var ResultsItem = require('views/TrackRow.jsx');

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
                    <span className="loading">Loading ...</span>
                </div>)
        }

        if (this.state.results.length === 0) {
            return (
                <div id="search-results">
                    <span className="loading">No Results Found</span>
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

