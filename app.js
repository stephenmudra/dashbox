
require('node-jsx').install({harmony: true});

var server =require('./server/server');
server.listen(3000, function() {
    console.log('Express server listening on port ' + server.address().port);
});