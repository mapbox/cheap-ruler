'use strict';

var runBench = require('./bench-run.js');

var cheapRuler = require('../');
var turf = require('turf');
var lines = require('../test/fixtures/lines.json');
var points = Array.prototype.concat.apply([], lines);

var ruler = cheapRuler(32.8351);

var bboxes = points.map(function (p) {
    return ruler.bufferPoint(p, 0.1);
});

runBench({
    'turf.inside + turf.bboxPolygon': function () {
        for (var i = 0; i < points.length; i++) {
            turf.inside(turf.point(points[i]), turf.bboxPolygon(bboxes[i]));
        }
    },
    'ruler.insideBBox': function () {
        var ruler = cheapRuler(32.8351);
        for (var i = 0; i < points.length; i++) {
            ruler.insideBBox(points[i], bboxes[i]);
        }
    }
});
