'use strict';

var Benchmark = require('benchmark');

var cheapRuler = require('../');
var turf = require('turf');
var lines = require('../test/fixtures/lines.json');
var points = Array.prototype.concat.apply([], lines);

var ruler = cheapRuler(32.8351);

var suite = new Benchmark.Suite();

suite
.add('turf.bearing', function () {
    for (var i = 0; i < points.length - 1; i++) {
        turf.bearing(turf.point(points[i]), turf.point(points[i + 1]));
    }
})
.add('ruler.bearing', function () {
    for (var i = 0; i < points.length - 1; i++) {
        ruler.bearing(points[i], points[i + 1]);
    }
})
.on('cycle', function (event) {
    console.log(String(event.target));
})
.run();
