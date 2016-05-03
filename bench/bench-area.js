'use strict';

var runBench = require('./bench-run.js');

var cheapRuler = require('../');
var turf = require('turf');
var lines = require('../test/fixtures/lines.json');

var polygons = [];

for (var i = 0; i < lines.length; i++) {
    if (lines[i].length >= 3) {
        polygons.push([lines[i].concat([lines[i][0]])]);
    }
}

runBench({
    'turf.area': function () {
        for (var i = 0; i < polygons.length; i++) {
            turf.area(turf.polygon(polygons[i]));
        }
    },
    'ruler.area': function () {
        var ruler = cheapRuler(32.8351);
        for (var i = 0; i < polygons.length; i++) {
            ruler.area(polygons[i]);
        }
    }
});
