
var request = require('superagent');
var crypto = require('crypto');

module.exports = function(req, res) {
    var hash = crypto.createHash('md5').update(req.connection.remoteAddress).digest('hex');

    res.json({
        hash: hash
    });
};
