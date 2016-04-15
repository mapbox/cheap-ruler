var Benchmark = require('benchmark');

var cheapRuler = require('../');
var turf = require('turf');
var lines = require('../test/fixtures/lines.json');

var ruler = cheapRuler(32.8351);

var suite = new Benchmark.Suite();

suite
.add('turf.lineDistance', function() {
    for (var i = 0; i < lines.length; i++) {
        turf.lineDistance(turf.linestring(lines[i]));
    }
})
.add('ruler.lineDistance', function() {
    for (var i = 0; i < lines.length; i++) {
        ruler.lineDistance(lines[i]);
    }
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.run();
