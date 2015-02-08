/**
 * Created by stephenmudra on 23/01/15.
 */


var request = require('superagent');

module.exports = function(req, res) {
    var tracklist = req.tracklist;

    tracklist.currentTrack(function (data) {
        if (data) {
            res.json(data);
        } else {
            res.json({});
        }
    })
};
