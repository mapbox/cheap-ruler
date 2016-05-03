'use strict';

var runBench = require('./bench-run.js');

var cheapRuler = require('../');
var turf = require('turf');
var lines = require('../test/fixtures/lines.json');
var points = Array.prototype.concat.apply([], lines);

runBench({
    'turf.destination': function () {
        for (var i = 0; i < points.length; i++) {
            turf.destination(turf.point(points[i]), 1, (i % 360) - 180, 'kilometers');
        }
    },
    'ruler.destination': function () {
        var ruler = cheapRuler(32.8351);
        for (var i = 0; i < points.length; i++) {
            ruler.destination(points[i], 1, (i % 360) - 180);
        }
    }
});
