'use strict';

var Benchmark = require('benchmark');

var cheapRuler = require('../');
var turf = require('turf');
var lines = require('../test/fixtures/lines.json');

var ruler = cheapRuler(32.8351);

var suite = new Benchmark.Suite();

var polygons = [];

for (var i = 0; i < lines.length; i++) {
    if (lines[i].length >= 3) {
        polygons.push([lines[i].concat([lines[i][0]])]);
    }
}

suite
.add('turf.area', function () {
    for (var i = 0; i < polygons.length; i++) {
        turf.area(turf.polygon(polygons[i]));
    }
})
.add('ruler.area', function () {
    for (var i = 0; i < polygons.length; i++) {
        ruler.area(polygons[i]);
    }
})
.on('cycle', function (event) {
    console.log(String(event.target));
})
.run();
