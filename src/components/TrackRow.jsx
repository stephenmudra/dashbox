/** @jsx React.DOM */
var React = require('react');

require('./TrackRow.scss');

var createStoreMixin = require('utils/createStoreMixin.js'),
    TrackActions = require('actions/TrackActions.js'),
    TrackStore = require('stores/TrackStore.js'),
    AlbumStore = require('stores/AlbumStore.js'),
    ArtistStore = require('stores/ArtistStore.js'),
    QueueStore = require('stores/QueueStore.js'),
    UserStore = require('stores/UserStore.js'),
    QueueActions = require('actions/QueueActions.js');

function dhm(t){
    t = t / 1000;
    var seconds = t % 60;
    t /= 60;
    var minutes = t % 60;
    return minutes.toFixed(0) + ':' + (seconds < 10 ? '0' + seconds.toFixed(0) : seconds.toFixed(0));
}


var ResultsItem = React.createClass({
    mixins: [createStoreMixin(TrackStore, QueueStore, UserStore)],

    getStateFromStores(props) {
        var track = TrackStore.get(props.id);

        if (!track) {
            return {
                track: {},
                album: {},
                user: {},
                artists: []
            }

        }

        return {
            track: track,
            album: AlbumStore.get(track.album),
            artists: track.artists.map(id => ArtistStore.get(id)),
            queue: QueueStore.get(track.id),
            user: UserStore.get()
        };
    },

    componentDidMount() {
        TrackActions.loadTrack(this.props.id);
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.id !== this.props.id) {
            this.setState(this.getStateFromStores(nextProps));
            TrackActions.loadTrack(nextProps.id);
        }
    },

    voteHandler () {
        QueueActions.voteSong(this.props.id);
    },

    render() {
        var track = this.state.track,
            album = this.state.album,
            artists = this.state.artists,
            queue = this.state.queue,
            image = null;

        if (!track.id) {
            return <div className='trackRow'>
                <div className='trackRow-details'>
                    Loading ...
                </div>
            </div>;
        }

        for (var i = 0, len = album.images.length; i < len; i++) {
            if (!image || image.width > album.images[i].width) {
                image = album.images[i];
            }
        }

        var voted = false;
        var votes = [];
        if (queue && this.state.user) {
            for(i = 0, len = queue.votes.length; i < len; i++) {
                votes.push(<img key={i}  src={'http://identicon.org?t=' + queue.votes[i].hash + ''} width="25" height="25" />);
                if (queue.votes[i].hash == this.state.user.hash) {
                    voted = true;
                }
            }
        }

        if (track.availableMarkets.indexOf('AU') === -1) {
            return <div />;
        }

        return <div className='trackRow'>
            <div className='trackRow-albumCover'>
                <img src={image.url} />
            </div>
            <div className='trackRow-details'>
                <strong>{track.name} {track.explicit ? <img src='./explicit.png' /> : ''}</strong><br />
                {artists.map(artist => artist.name).join(', ')}
            </div>
            {this.props.showVotes ? votes : ''}
            <div className='trackRow-voteWrapper'>
                <button className={voted ? 'trackRow-voted' : 'trackRow-vote'} onClick={this.voteHandler}>
                    <span className='trackRow-voteCurrent'>{queue ? queue.votes.length : 0}</span>
                    <span className='trackRow-addOne'>+1</span>
                </button>
            </div>
        </div>;
    }
});

module.exports = ResultsItem;
