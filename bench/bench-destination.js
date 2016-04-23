'use strict';

var Benchmark = require('benchmark');

var cheapRuler = require('../');
var turf = require('turf');
var lines = require('../test/fixtures/lines.json');
var points = Array.prototype.concat.apply([], lines);

var ruler = cheapRuler(32.8351);

var suite = new Benchmark.Suite();

suite
.add('turf.destination', function () {
    for (var i = 0; i < points.length; i++) {
        turf.destination(turf.point(points[i]), 1, (i % 360) - 180, 'kilometers');
    }
})
.add('ruler.destination', function () {
    for (var i = 0; i < points.length; i++) {
        ruler.destination(points[i], 1, (i % 360) - 180);
    }
})
.on('cycle', function (event) {
    console.log(String(event.target));
})
.run();
