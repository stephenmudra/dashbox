
'use strict';

var React = require('react/addons');
var assert = require('chai').assert;


var TrackRow = require('views/TrackRow.jsx');
var ReactTestUtils;

describe('NotFoundComponent', function() {

    beforeEach(function() {
        ReactTestUtils = React.addons.TestUtils;
    });

    it('should render', function() {
        var instance = ReactTestUtils.renderIntoDocument(<TrackRow />);

        assert.isDefined(instance, 'Root has been defined');
    });

});