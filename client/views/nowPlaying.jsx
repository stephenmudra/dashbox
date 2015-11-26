var React = require('react');
var request = require('superagent');

var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame;


var PlayingStore = require('stores/PlayingStore'),
    TrackStore = require('stores/TrackStore'),
    AlbumStore = require('stores/AlbumStore.js'),
    ArtistStore = require('stores/ArtistStore.js'),
    createStoreMixin = require('utils/createStoreMixin'),
    WaveFormStore = require('stores/WaveFormStore.js');

var ResultsItem = require('views/TrackRow.jsx'),
    VisCanvas = require('views/visCanvas.jsx');


function dhm(t){
    t = t / 1000;
    var seconds = parseInt(t % 60,10);
    t /= 60;
    var minutes = parseInt(t % 60,10);
    return minutes.toFixed(0) + ':' + (seconds < 10 ? '0' + seconds.toFixed(0) : seconds.toFixed(0));
}

var NowPlaying = React.createClass({
    mixins: [createStoreMixin(PlayingStore, TrackStore, WaveFormStore)],

    getStateFromStores() {
        var playing = PlayingStore.get(),
            track = TrackStore.get(playing.track);

        if (!track) {
            return {
                track: {},
                album: {},
                user: {},
                artists: [],
                votes: [],
                related: [],
                waveform: {}
            };
        }

        var waveform = WaveFormStore.get();
        if (waveform && waveform.segments) {
            this.normalizeColor(waveform);

            var r = 0, g = 0, b = 0;

            for (var i = 0, len = waveform.segments.length; i < len; i++) {
                var result = this.getColor(waveform.segments[i]);
                r += result[0];
                g += result[1];
                b += result[2];
            }

            document.body.style.backgroundImage = "linear-gradient(to bottom, #315481, "+this.to_rgb(r/waveform.segments.length, g/waveform.segments.length, b/waveform.segments.length)+" 150%)";

        }

        return {
            track: TrackStore.get(playing.track),
            album: AlbumStore.get(track.album),
            artists: track.artists.map(id => ArtistStore.get(id)),
            currentPosition: playing.currentPosition,
            currentTime: playing.currentTime,
            votes: playing.votes,
            related: playing.related,
            waveform: waveform
        };
    },

    componentDidMount() {
        requestAnimationFrame(this.updateTime);
    },

    componentWillReceiveProps() {
        this.setState(this.getStateFromStores());
    },


    normalizeColor(waveform) {
        this.cmin = [100,100,100];
        this.cmax = [-100,-100,-100];

        var qlist = waveform.segments;
        for (var i = 0; i < qlist.length; i++) {
            for (var j = 0; j < 3; j++) {
                var t = qlist[i].timbre[j];

                if (t < this.cmin[j]) {
                    this.cmin[j] = t;
                }
                if (t > this.cmax[j]) {
                    this.cmax[j] = t;
                }
            }
        }
    },

    getColor(seg) {
        var results = [];

        for (var i = 0; i < 3; i++) {
            var t = seg.timbre[i];
            var norm = (t - this.cmin[i]) / (this.cmax[i] - this.cmin[i]);
            results[i] = norm * 255;
        }
        return results;
    },

    convert(value) {
        var integer = Math.round(value);
        var str = Number(integer).toString(16);
        return str.length == 1 ? "0" + str : str;
    },

    to_rgb(r, g, b) {
        return "#" + this.convert(r) + this.convert(g) + this.convert(b);
    },

    updateTime () {
        var currentPosition = this.state.currentPosition;

        if (currentPosition) {
            var date = new Date().getTime();
            var position = currentPosition.position + date - this.state.currentTime;

            var progress = document.getElementsByClassName('middleLayer');
            if (progress[0]) {
                progress[0].style.width = Math.min(position / currentPosition.duration * 100, 100) + '%';
            }
        }

        if (this.isMounted()) {
            requestAnimationFrame(this.updateTime);
        }
    },

    render() {

        var currentPosition = this.state.currentPosition;

        var track = this.state.track,
            album = this.state.album,
            artists = this.state.artists,
            image = null;

        if (!currentPosition || !track) {
            return (
                <div id="nowPlaying">
                    <div className='topLayer'>
                        <div className='cover'></div>
                        <div className='details'>
                            <h3>Loading ...</h3>
                        </div>
                        <div className='related'></div>
                    </div>
                </div>
            );
        }

        var divStyle = {
            width: Math.min(currentPosition.position / currentPosition.duration * 100, 100) + '%'
        };


        for (var i = 0, len = album.images.length; i < len; i++) {
            if (!image || (image.width > album.images[i].width && album.images[i].width > 150)) {
                image = album.images[i];
            }
        }

        var votes = [];
        if (this.state.votes) {
            for(i = 0, len = this.state.votes.length; i < len; i++) {
                votes.push(<img key={i}  src={'http://identicon.org?t=' + this.state.votes[i].hash + ''} width="35" height="35" />);
            }
        }

        var related = [];
        if (this.state.related) {
            for(i = 0, len = this.state.related.length; i < len; i++) {
                if (this.state.related[i] != track.id) {
                    related.push(<ResultsItem key={this.state.related[i]} id={this.state.related[i]} />);
                }

                if (related.length == 3) {
                    i = len;
                }
            }
        }

        var centerAlign = {
            textAlign: 'center'
        };

        var waveform = this.state.waveform.track;

        //(minor, major) 0, 1
        var mode = ['Minor', 'Major'];
        // (c, c-sharp, d, e-flat, e, f, f-sharp, g, a-flat, a, b-flat, b) 0 - 11
        var key = ['C','C#', 'D', 'E♭', 'E', 'F', 'F#', 'G', 'A♭', 'A', 'B♭', 'B'];

        return (
            <div id="nowPlaying">
                <VisCanvas id={track.id} />
                <div className='middleLayer' style={divStyle} />
                <div className='topLayer'>
                    <div className='cover'>
                        <img src={image.url} />
                    </div>
                    <div className='details'>
                        <h3>{artists.map(artist => artist.name).join(', ')}</h3>
                        <h2>{track.name}</h2>
                        {votes}
                    </div>
                    <div className='related'>
                        {related}
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = NowPlaying;
