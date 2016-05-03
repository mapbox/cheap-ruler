'use strict';

var runBench = require('./bench-run.js');

var cheapRuler = require('../');
var turf = require('turf');
var lines = require('../test/fixtures/lines.json');

runBench({
    'turf.lineDistance': function () {
        for (var i = 0; i < lines.length; i++) {
            turf.lineDistance(turf.linestring(lines[i]));
        }
    },
    'ruler.lineDistance': function () {
        var ruler = cheapRuler(32.8351);
        for (var i = 0; i < lines.length; i++) {
            ruler.lineDistance(lines[i]);
        }
    },
    'new ruler for every point': function () {
        for (var i = 0; i < lines.length; i++) {
            var sum = 0;
            for (var j = 0; j < lines[i].length - 1; j++) {
                var p1 = lines[i][j];
                var p2 = lines[i][j + 1];
                sum += cheapRuler((p1[1] + p2[1]) / 2).distance(p1, p2);
            }
        }
    }
});
