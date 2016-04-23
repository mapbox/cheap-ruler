'use strict';

var runBench = require('./bench-run.js');

var cheapRuler = require('../');
var turf = require('turf');
var lines = require('../test/fixtures/lines.json');

var ruler = cheapRuler(32.8351);

runBench({
    'turf.lineDistance': function () {
        for (var i = 0; i < lines.length; i++) {
            turf.lineDistance(turf.linestring(lines[i]));
        }
    },
    'ruler.lineDistance': function () {
        for (var i = 0; i < lines.length; i++) {
            ruler.lineDistance(lines[i]);
        }
    }
});
