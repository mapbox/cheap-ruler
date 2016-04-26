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

test('cheapRuler constructor', function (t) {
    t.throws(function () {
        createRuler();
    }, 'errors without latitude');
    t.end();
});

test('distance', function (t) {
    for (var i = 0; i < points.length - 1; i++) {
        var expected = turf.distance(turf.point(points[i]), turf.point(points[i + 1]));
        var actual = ruler.distance(points[i], points[i + 1]);
        assertErr(t, expected, actual, 0.003, 'distance');
    }
    t.pass('distance within 0.3%');
    t.end();
});

test('distance in miles', function (t) {
    var d = ruler.distance([30.5, 32.8351], [30.51, 32.8451]);
    var d2 = milesRuler.distance([30.5, 32.8351], [30.51, 32.8451]);

    assertErr(t, d / d2, 1.609344, 1e-12, 'distance in miles');
    t.pass('distance in miles');
    t.end();
});

test('bearing', function (t) {
    for (var i = 0; i < points.length - 1; i++) {
        var expected = turf.bearing(turf.point(points[i]), turf.point(points[i + 1]));
        var actual = ruler.bearing(points[i], points[i + 1]);
        assertErr(t, expected, actual, 0.005, 'bearing');
    }
    t.pass('bearing within 0.05%');
    t.end();
});

test('destination', function (t) {
    for (var i = 0; i < points.length; i++) {
        var bearing = (i % 360) - 180;
        var expected = turf.destination(turf.point(points[i]), 1.0, bearing, 'kilometers').geometry.coordinates;
        var actual = ruler.destination(points[i], 1.0, bearing);
        assertErr(t, expected[0], actual[0], 1e-6, 'destination longitude');
        assertErr(t, expected[1], actual[1], 1e-6, 'destination latitude');
    }
    t.pass('destination within 1e-6');
    t.end();
});

test('lineDistance', function (t) {
    for (var i = 0; i < lines.length; i++) {
        var expected = turf.lineDistance(turf.linestring(lines[i]));
        var actual = ruler.lineDistance(lines[i]);
        assertErr(t, expected, actual, 0.003, 'lineDistance');
    }
    t.pass('lineDistance within 0.3%');
    t.end();
});

test('area', function (t) {
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].length < 3) continue;
        var poly = turf.polygon([lines[i].concat([lines[i][0]])]);
        var expected = turf.area(poly) / 1e6;
        var actual = ruler.area([lines[i]]);
        assertErr(t, expected, actual, 0.003, 'area');
    }
    t.pass('area within 0.3%');
    t.end();
});

test('along', function (t) {
    for (var i = 0; i < lines.length; i++) {
        var line = turf.linestring(lines[i]);
        var dist = turf.lineDistance(line) / 2;
        var expected = turf.along(line, dist, 'kilometers').geometry.coordinates;
        var actual = ruler.along(lines[i], dist);
        assertErr(t, expected[0], actual[0], 1e-6, 'along longitude');
        assertErr(t, expected[1], actual[1], 1e-6, 'along latitude');
    }
    t.pass('along point within 1e-6');
    t.end();
});

test('along with dist <= 0', function (t) {
    t.same(ruler.along(lines[0], -5), lines[0][0], 'first point');
    t.end();
});

test('along with dist > length', function (t) {
    t.same(ruler.along(lines[0], 1000), lines[0][lines[0].length - 1], 'last point');
    t.end();
});

test('pointOnLine', function (t) {
    // not Turf comparison because pointOnLine is bugged https://github.com/Turfjs/turf/issues/344
    var line = [[-77.031669, 38.878605], [-77.029609, 38.881946]];
    var p = ruler.pointOnLine(line, [-77.034076, 38.882017]).point;
    t.same(p, [-77.03052697027461, 38.880457194811896], 'pointOnLine');
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

        assertErr(t, expected, actual, 0, 'lineSlice length');
    }
    t.pass('lineSlice length the same');
    t.end();
});

test('lineSliceAlong', function (t) {
    for (var i = 0; i < lines.length; i++) {
        if (i === 46) continue; // skip due to Turf bug https://github.com/Turfjs/turf/issues/351

        var line = lines[i];
        var dist = ruler.lineDistance(line);
        var start = ruler.along(line, dist * 0.3);
        var stop = ruler.along(line, dist * 0.7);

        var expected = ruler.lineDistance(turf.lineSlice(
            turf.point(start), turf.point(stop), turf.linestring(line)).geometry.coordinates);
        var actual = ruler.lineDistance(ruler.lineSliceAlong(dist * 0.3, dist * 0.7, line));

        assertErr(t, expected, actual, 1e-10, 'lineSliceAlong length');
    }
    t.pass('lineSliceAlong length within 1e-10');
    t.end();
});

test('lineSlice reverse', function (t) {
    var line = lines[0];
    var dist = ruler.lineDistance(line);
    var start = ruler.along(line, dist * 0.7);
    var stop = ruler.along(line, dist * 0.3);
    var actual = ruler.lineDistance(ruler.lineSlice(start, stop, line));
    t.equal(actual, 0.018676802802910702, 'lineSlice reversed length');
    t.end();
});

test('bufferPoint', function (t) {
    for (var i = 0; i < points.length; i++) {
        var expected = turfPointBuffer(points[i], 0.1);
        var actual = milesRuler.bufferPoint(points[i], 0.1);
        assertErr(t, expected[0], actual[0], 2e-7, 'bufferPoint west');
        assertErr(t, expected[1], actual[1], 2e-7, 'bufferPoint east');
        assertErr(t, expected[2], actual[2], 2e-7, 'bufferPoint south');
        assertErr(t, expected[3], actual[3], 2e-7, 'bufferPoint north');
    }
    t.pass('point buffer error within 2e-7');
    t.end();
});

test('bufferBBox', function (t) {
    var bbox = [30, 38, 40, 39];
    var bbox2 = ruler.bufferBBox(bbox, 1);
    t.same(bbox2, [29.989319515875376, 37.99098271225711, 40.01068048412462, 39.00901728774289], 'bufferBBox');
    t.end();
});

test('insideBBox', function (t) {
    var bbox = [30, 38, 40, 39];
    t.ok(ruler.insideBBox([35, 38.5], bbox), 'insideBBox inside');
    t.notOk(ruler.insideBBox([45, 45], bbox), 'insideBBox outside');
    t.end();
});

test('cheapRuler.fromTile', function (t) {
    var ruler1 = createRuler(50.5);
    var ruler2 = createRuler.fromTile(11041, 15);

    var p1 = [30.5, 50.5];
    var p2 = [30.51, 50.51];

    assertErr(t, ruler1.distance(p1, p2), ruler2.distance(p1, p2), 2e-5, 'cheapRuler.fromTile distance');

    t.end();
});

function turfPointBuffer(p, distance) {
    var dist = Math.sqrt(2) * distance;
    var pt = turf.point(p);
    var sw = turf.destination(pt, dist, -135, 'miles');
    var ne = turf.destination(pt, dist, 45, 'miles');
    return sw.geometry.coordinates.concat(ne.geometry.coordinates);
}
