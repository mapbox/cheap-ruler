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

test('along', function (t) {
    for (var i = 0; i < lines.length; i++) {
        var line = turf.linestring(lines[i]);
        var dist = turf.lineDistance(line) / 2;
        var expected = turf.along(line, dist, 'kilometers').geometry.coordinates;
        var actual = ruler.along(lines[i], dist);
        assertErr(t, expected[0], actual[0], 2e-7, 'along longitude');
        assertErr(t, expected[1], actual[1], 2e-7, 'along latitude');
    }
    t.pass('lineDistance within 0.1%');
    t.end();
});

test('lineSlice', function (t) {
    for (var i = 0; i < lines.length; i++) {
        if (i === 46) continue; // skip due to Turf bug https://github.com/Turfjs/turf/issues/351

        var line = lines[i];
        var dist = ruler.lineDistance(line);
        var start = ruler.along(line, dist * 0.3);
        var stop = ruler.along(line, dist * 0.7);

        var expected = ruler.lineDistance(turf.lineSlice(
            turf.point(start), turf.point(stop), turf.linestring(line)).geometry.coordinates);
        var actual = ruler.lineDistance(ruler.lineSlice(start, stop, line));

        assertErr(t, expected, actual, 0.001, 'lineSlice length');
    }
    t.pass('lineSlice length within 0.1%');
    t.end();
});

test('area', function (t) {
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].length < 3) continue;
        var poly = turf.polygon([lines[i].concat([lines[i][0]])]);
        var expected = turf.area(poly) / 1e6;
        var actual = ruler.area([lines[i]]);
        assertErr(t, expected, actual, 0.0002, 'area');
    }
    t.pass('area within 0.02%');
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

test('destination', function (t) {
    for (var i = 0; i < points.length; i++) {
        var bearing = (i % 360) - 180;
        var expected = turf.destination(turf.point(points[i]), 1.0, bearing, 'kilometers').geometry.coordinates;
        var actual = ruler.destination(points[i], 1.0, bearing);
        assertErr(t, expected[0], actual[0], 3e-7, 'destination longitude');
        assertErr(t, expected[1], actual[1], 3e-7, 'destination latitude');
    }
    t.pass('destination within 3e-7');
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

test('pointOnLine', function (t) {
    // not Turf comparison because pointOnLine is bugged https://github.com/Turfjs/turf/issues/344
    var line = [[-77.031669, 38.878605], [-77.029609, 38.881946]];
    var p = ruler.pointOnLine(line, [-77.034076, 38.882017]).point;
    t.same(p, [-77.03051972665213, 38.88046894284234]);
    t.end();
});

function turfPointBuffer(p, distance) {
    var dist = Math.sqrt(2) * distance;
    var pt = turf.point(p);
    var sw = turf.destination(pt, dist, -135, 'miles');
    var ne = turf.destination(pt, dist, 45, 'miles');
    return sw.geometry.coordinates.concat(ne.geometry.coordinates);
}
