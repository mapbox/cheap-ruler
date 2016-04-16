'use strict';

var Benchmark = require('benchmark');

var cheapRuler = require('../');
var turf = require('turf');
var lines = require('../test/fixtures/lines.json');

var ruler = cheapRuler(32.8351);

var suite = new Benchmark.Suite();

suite
.add('turf.destination-based bbox', function () {
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        for (var j = 0; j < line.length; j++) {
            bboxBuffer(turf.point(line[j]), 0.01);
        }
    }
})
.add('ruler.bufferPoint', function () {
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        for (var j = 0; j < line.length; j++) {
            ruler.bufferPoint(line[j], 0.01);
        }
    }
})
.on('cycle', function (event) {
    console.log(String(event.target));
})
.run();

function bboxBuffer(pt, distance) {
    var sw = turf.destination(pt, distance, -135);
    var ne = turf.destination(pt, distance, 45);
    return sw.geometry.coordinates.concat(ne.geometry.coordinates);
}
