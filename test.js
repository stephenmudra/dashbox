

var Spotify = require('spotify-web');
var lame = require('lame');
var Speaker = require('speaker');

// determine the URI to play, ensure it's a "track" URI
var uri = 'spotify:track:1ZBAee0xUblF4zhfefY0W1';
var type = Spotify.uriType(uri);
if ('track' != type) {
    throw new Error('Must pass a "track" URI, got ' + JSON.stringify(type));
}

// initiate the Spotify session
Spotify.login('1230973339', '9333790321', function (err, spotify) {
    if (err) throw err;

    // first get a "Track" instance from the track URI
    spotify.get(uri, function (err, track) {
        console.log(track);
        if (err) throw err;
        console.log('Playing: %s - %s', track.artist[0].name, track.name);

        track.play()
            .pipe(new lame.Decoder())
            .on('data', console.log)
            .pipe(new Speaker())
            .on('finish', function () {
                spotify.disconnect();
            });

    });
});
