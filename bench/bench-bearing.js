var Benchmark = require('benchmark');

var cheapRuler = require('../');
var turf = require('turf');
var lines = require('../test/fixtures/lines.json');

var ruler = cheapRuler(32.8351);

var suite = new Benchmark.Suite();

suite
.add('turf.bearing', function() {
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        for (var j = 0; j < line.length - 1; j++) {
            turf.bearing(turf.point(lines[i][j]), turf.point(lines[i][j + 1]));
        }
    }
})
.add('ruler.bearing', function() {
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        for (var j = 0; j < line.length - 1; j++) {
            ruler.bearing(lines[i][j], lines[i][j + 1]);
        }
    }
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.run();
