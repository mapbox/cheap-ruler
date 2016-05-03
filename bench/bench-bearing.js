'use strict';

var runBench = require('./bench-run.js');

var cheapRuler = require('../');
var turf = require('turf');
var lines = require('../test/fixtures/lines.json');
var points = Array.prototype.concat.apply([], lines);

runBench({
    'turf.bearing': function () {
        for (var i = 0; i < points.length - 1; i++) {
            turf.bearing(turf.point(points[i]), turf.point(points[i + 1]));
        }
    },
    'ruler.bearing': function () {
        var ruler = cheapRuler(32.8351);
        for (var i = 0; i < points.length - 1; i++) {
            ruler.bearing(points[i], points[i + 1]);
        }
    }
});
