'use strict';

var runBench = require('./bench-run.js');

var cheapRuler = require('../');
var turf = require('turf');
var lines = require('../test/fixtures/lines.json');

var ruler = cheapRuler(32.8351);

var endpoints = lines.map(function (line) {
    var dist = ruler.lineDistance(line);
    return {
        start: ruler.along(line, dist * 0.3),
        stop: ruler.along(line, dist * 0.7)
    };
});

runBench({
    'turf.lineSlice': function () {
        for (var i = 0; i < lines.length; i++) {
            turf.lineSlice(
                turf.point(endpoints[i].start),
                turf.point(endpoints[i].stop),
                turf.linestring(lines[i]));
        }
    },
    'ruler.lineSlice': function () {
        var ruler = cheapRuler(32.8351);
        for (var i = 0; i < lines.length; i++) {
            ruler.lineSlice(endpoints[i].start, endpoints[i].stop, lines[i]);
        }
    }
});
