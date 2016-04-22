'use strict';

var Benchmark = require('benchmark');

var cheapRuler = require('../');
var turf = require('turf');
var lines = require('../test/fixtures/lines.json');

var ruler = cheapRuler(32.8351);

var suite = new Benchmark.Suite();

var distances = lines.map(function (line) {
    return ruler.lineDistance(line);
});

suite
.add('turf.along', function () {
    for (var i = 0; i < lines.length; i++) {
        turf.along(turf.linestring(lines[i]), distances[i], 'kilometers');
    }
})
.add('ruler.along', function () {
    for (var i = 0; i < lines.length; i++) {
        ruler.along(lines[i], distances[i]);
    }
})
.on('cycle', function (event) {
    console.log(String(event.target));
})
.run();
