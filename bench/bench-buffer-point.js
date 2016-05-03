'use strict';

var runBench = require('./bench-run.js');

var cheapRuler = require('../');
var turf = require('turf');
var lines = require('../test/fixtures/lines.json');
var points = Array.prototype.concat.apply([], lines);

runBench({
    'turf.destination-based bbox': function () {
        for (var i = 0; i < points.length; i++) {
            bboxBuffer(turf.point(points[i]), 0.01);
        }
    },
    'ruler.bufferPoint': function () {
        var ruler = cheapRuler(32.8351);
        for (var i = 0; i < points.length; i++) {
            ruler.bufferPoint(points[i], 0.01);
        }
    }
});

function bboxBuffer(pt, distance) {
    var sw = turf.destination(pt, distance, -135);
    var ne = turf.destination(pt, distance, 45);
    return sw.geometry.coordinates.concat(ne.geometry.coordinates);
}
