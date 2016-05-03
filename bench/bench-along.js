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
    'turf.along': function () {
        for (var i = 0; i < lines.length; i++) {
            turf.along(turf.linestring(lines[i]), distances[i], 'kilometers');
        }
    },
    'ruler.along': function () {
        var ruler = cheapRuler(32.8351);
        for (var i = 0; i < lines.length; i++) {
            ruler.along(lines[i], distances[i]);
        }
    }
});
