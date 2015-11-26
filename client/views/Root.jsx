var React = require('react');

var Content = require('views/content.jsx');
var TrackQueue = require('views/trackQueue.jsx');
var Menu = require('views/menu.jsx');
var NowPlaying = require('views/nowPlaying.jsx');

var Root = React.createClass({
    render: function() {
        return (
            <div>
                <div id="containerHeader">
                    <NowPlaying />
                </div>
                <div id="containerBody">
                    <div id="containerBody-left">
                        <TrackQueue />

                    </div>
                    <div id="containerBody-right">
                        <Content />
                        <Menu />
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = Root;
