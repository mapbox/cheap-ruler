'use strict';

var Benchmark = require('benchmark');

var cheapRuler = require('../');
var turf = require('turf');
var lines = require('../test/fixtures/lines.json');

var ruler = cheapRuler(32.8351);

var suite = new Benchmark.Suite();

suite
.add('turf.destination', function () {
    var k = 0;
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        for (var j = 0; j < line.length; j++) {
            k++;
            turf.destination(turf.point(lines[i][j]), 1, (k % 360) - 180, 'kilometers');
        }
    }
})
.add('ruler.destination', function () {
    var k = 0;
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        for (var j = 0; j < line.length; j++) {
            k++;
            ruler.destination(lines[i][j], 1, (k % 360) - 180);
        }
    }
})
.on('cycle', function (event) {
    console.log(String(event.target));
})
.run();
