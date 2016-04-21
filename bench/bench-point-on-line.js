'use strict';

var Benchmark = require('benchmark');

var cheapRuler = require('../');
var turf = require('turf');
var lines = require('../test/fixtures/lines.json');

var ruler = cheapRuler(32.8351);
var p = [-96.9159, 32.8351];

var suite = new Benchmark.Suite();

suite
.add('turf.pointOnLine', function () {
    for (var i = 0; i < lines.length; i++) {
        turf.pointOnLine(turf.linestring(lines[i]), turf.point(p));
    }
})
.add('ruler.pointOnLine', function () {
    for (var i = 0; i < lines.length; i++) {
        ruler.pointOnLine(lines[i], p);
    }
})
.on('cycle', function (event) {
    console.log(String(event.target));
})
.run();
