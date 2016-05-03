'use strict';

var runBench = require('./bench-run.js');

var cheapRuler = require('../');
var turf = require('turf');
var lines = require('../test/fixtures/lines.json');

var ruler = cheapRuler(32.8351);

var distances = lines.map(function (line) {
    return ruler.lineDistance(line);
});

runBench({
    'turf.along + turf.lineSlice': function () {
        for (var i = 0; i < lines.length; i++) {
            var feature = turf.linestring(lines[i]);
            turf.lineSlice(
                turf.along(feature, distances[i] * 0.3),
                turf.along(feature, distances[i] * 0.7),
                turf.linestring(lines[i]));
        }
    },
    'ruler.lineSliceAlong': function () {
        var ruler = cheapRuler(32.8351);
        for (var i = 0; i < lines.length; i++) {
            ruler.lineSliceAlong(distances[i] * 0.3, distances[i] * 0.7, lines[i]);
        }
    }
});
