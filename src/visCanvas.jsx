/**
 * Created by stephenmudra on 17/01/15.
 */

/** @jsx React.DOM */
var React = require('react');
var request = require('superagent');

var WaveFormStore = require('stores/WaveFormStore.js');

var VisCanvas = React.createClass({
    getInitialState() {
        return this.getStateFromStores(this.props);
    },

    componentWillUnmount() {
        WaveFormStore.removeChangeListener(this.handleStoresChanged);
    },

    getStateFromStores(props) {
        var waveform = WaveFormStore.get();

        if (props.id == waveform.id) {
            return waveform;
        } else {
            return {};
        }
    },

    componentDidMount: function() {
        WaveFormStore.addChangeListener(this.handleStoresChanged);

        var domNode = this.getDOMNode();

        this.ctx = domNode.getContext("2d");

        this.setState(this.getStateFromStores(this.props));
        this.updateVis();
    },


    handleStoresChanged() {
        if (this.isMounted()) {
            this.setState(this.getStateFromStores(this.props));
            this.updateVis();
        }
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.id !== this.props.id) {
            this.ctx.clearRect(0, 0, this.width, 200);
            this.setState(this.getStateFromStores(nextProps));
            this.updateVis();
        }
    },

    normalizeColor() {
        this.cmin = [100,100,100];
        this.cmax = [-100,-100,-100];

        var qlist = this.state.segments;
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
        return this.to_rgb(results[0], results[1], results[2]);
    },

    convert(value) {
        var integer = Math.round(value);
        var str = Number(integer).toString(16);
        return str.length == 1 ? "0" + str : str;
    },

    to_rgb(r, g, b) {
        return "#" + this.convert(r) + this.convert(g) + this.convert(b);
    },

    updateVis: function () {
        if (!this.state.segments || !this.isMounted()) {
            return;
        }

        this.normalizeColor();

        var segment = this.state.segments;

        this.width = document.getElementById('container').clientWidth;

        var domNode = this.getDOMNode();
        //this.ctx = domNode.getContext("2d");
        domNode.width = this.width;

        this.ctx.clearRect(0, 0, this.width, 200);

        var secondLength = this.width / this.state.track.duration;

        var lineWidth;

        for (var i = 0, len = segment.length; i < len; i++) {
            // fillRect(x, y, width, height)
            var startX = segment[i].start * secondLength;

            this.ctx.beginPath();
            lineWidth = segment[i].loudness_max_time * secondLength;
            this.ctx.moveTo(startX + lineWidth /2, 10 + Math.abs(segment[i].loudness_start * 4));
            this.ctx.lineTo(startX + lineWidth /2, 190 + segment[i].loudness_start * 4);
            startX += lineWidth;
            this.ctx.lineWidth = lineWidth;
            this.ctx.strokeStyle = this.getColor(segment[i]);
            this.ctx.globalAlpha = 0.5;
            this.ctx.stroke();

            this.ctx.beginPath();
            lineWidth = (segment[i].duration - segment[i].loudness_max_time) * secondLength;
            this.ctx.moveTo(startX + lineWidth/2, 10 + Math.abs(segment[i].loudness_max * 4));
            this.ctx.lineTo(startX + lineWidth/2, 190 + segment[i].loudness_max * 4);
            startX += lineWidth;
            this.ctx.lineWidth = lineWidth;
            this.ctx.strokeStyle = this.getColor(segment[i]);
            this.ctx.globalAlpha = 0.5;
            this.ctx.stroke();

        }

       // window.setTimeout(this.updateVis, 100);
    },

    shouldComponentUpdate: function() {
        return false;
    },

    render: function() {
        return (
            <canvas width="200" height="200" />
        );
    }
});

module.exports = VisCanvas;