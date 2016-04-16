'use strict';

var test = require('tape').test;
var createRuler = require('../');
var turf = require('turf');
var lines = require('./fixtures/lines.json');
var points = Array.prototype.concat.apply([], lines);

var ruler = createRuler(32.8351);
var milesRuler = createRuler(32.8351, 'miles');

function assertErr(t, actual, expected, maxErr, description) {
    if (isNaN(actual) || isNaN(expected)) t.fail(description + ' produced NaN');
    var err = Math.abs((actual - expected) / expected);
    if (err > maxErr) t.fail(description + ', err: ' + err);
}

test('distance', function (t) {
    for (var i = 0; i < points.length - 1; i++) {
        var expected = turf.distance(turf.point(points[i]), turf.point(points[i + 1]));
        var actual = ruler.distance(points[i], points[i + 1]);
        assertErr(t, expected, actual, 0.001, 'distance');
    }
    t.pass('distance within 0.1%');
    t.end();
});

test('lineDistance', function (t) {
    for (var i = 0; i < lines.length; i++) {
        var expected = turf.lineDistance(turf.linestring(lines[i]));
        var actual = ruler.lineDistance(lines[i]);
        assertErr(t, expected, actual, 0.001, 'lineDistance');
    }
    t.pass('lineDistance within 0.1%');
    t.end();
});

test('bearing', function (t) {
    for (var i = 0; i < points.length - 1; i++) {
        var expected = turf.bearing(turf.point(points[i]), turf.point(points[i + 1]));
        var actual = ruler.bearing(points[i], points[i + 1]);
        assertErr(t, expected, actual, 0.0001, 'bearing');
    }
    t.pass('bearing within 0.01%');
    t.end();
});

test('bufferPoint', function (t) {
    for (var i = 0; i < points.length; i++) {
        var expected = turfPointBuffer(points[i], 0.01);
        var actual = milesRuler.bufferPoint(points[i], 0.01);
        assertErr(t, expected[0], actual[0], 1e-8, 'bufferPoint west');
        assertErr(t, expected[1], actual[1], 1e-8, 'bufferPoint east');
        assertErr(t, expected[2], actual[2], 1e-8, 'bufferPoint south');
        assertErr(t, expected[3], actual[3], 1e-8, 'bufferPoint north');
    }
    t.pass('point buffer error within 1e-8');
    t.end();
});

function turfPointBuffer(p, distance) {
    var dist = Math.sqrt(2) * distance;
    var pt = turf.point(p);
    var sw = turf.destination(pt, dist, -135, 'miles');
    var ne = turf.destination(pt, dist, 45, 'miles');
    return sw.geometry.coordinates.concat(ne.geometry.coordinates);
}
