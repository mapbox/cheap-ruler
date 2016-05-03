'use strict';

var runBench = require('./bench-run.js');

var cheapRuler = require('../');
var turf = require('turf');
var lines = require('../test/fixtures/lines.json');

var p = [-96.9159, 32.8351];

runBench({
    'turf.pointOnLine': function () {
        for (var i = 0; i < lines.length; i++) {
            turf.pointOnLine(turf.linestring(lines[i]), turf.point(p));
        }
    },
    'ruler.pointOnLine': function () {
        var ruler = cheapRuler(32.8351);
        for (var i = 0; i < lines.length; i++) {
            ruler.pointOnLine(lines[i], p);
        }
    }
});
