var React = require('react');

var Content = require('./content.js');
/*var TrackQueue = require('views/trackQueue.jsx');
var Menu = require('views/menu.jsx');
var NowPlaying = require('views/nowPlaying.jsx');*/

var Root = React.createClass({
    render: function() {
        return (
            <div>
                <div id="containerHeader">

                </div>
                <div id="containerBody">
                    <div id="containerBody-left">

                    </div>
                    <div id="containerBody-right">
                        <Content />

                    </div>
                </div>
            </div>
        );
    }
});

module.exports = Root;
