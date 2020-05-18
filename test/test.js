import {test} from 'tape';
import CheapRuler from '../index.js';
import * as turf from '@turf/turf';
import lines from './fixtures/lines.json';

const points = Array.prototype.concat.apply([], lines);

const ruler = new CheapRuler(32.8351);
const milesRuler = new CheapRuler(32.8351, 'miles');

function assertErr(t, actual, expected, maxErr, description) {
    if (isNaN(actual) || isNaN(expected)) t.fail(`${description} produced NaN`);
    const err = Math.abs((actual - expected) / expected);
    if (err > maxErr) t.fail(`${description}, err: ${err}`);
}

test('cheapRuler constructor', (t) => {
    t.throws(() => {
        const ruler = new CheapRuler();
        ruler.distance(null, null);
    }, 'errors without latitude');
    t.end();
});

test('distance', (t) => {
    for (let i = 0; i < points.length - 1; i++) {
        const expected = turf.distance(turf.point(points[i]), turf.point(points[i + 1]));
        const actual = ruler.distance(points[i], points[i + 1]);
        assertErr(t, expected, actual, 0.003, 'distance');
    }
    t.pass('distance within 0.3%');
    t.end();
});

test('distance over dateline', (t) => {
    const p0 = [179.9, 32.7];
    const p1 = [-179.9, 32.9];
    const expected = turf.distance(turf.point(p0), turf.point(p1));
    const actual = ruler.distance(p0, p1);
    assertErr(t, expected, actual, 0.001, 'distance');
    t.pass('distance within 0.1%');
    t.end();
});

test('distance in miles', (t) => {
    const d = ruler.distance([30.5, 32.8351], [30.51, 32.8451]);
    const d2 = milesRuler.distance([30.5, 32.8351], [30.51, 32.8451]);

    assertErr(t, d / d2, 1.609344, 1e-12, 'distance in miles');
    t.pass('distance in miles');
    t.end();
});

test('bearing', (t) => {
    for (let i = 0; i < points.length - 1; i++) {
        const expected = turf.bearing(turf.point(points[i]), turf.point(points[i + 1]));
        const actual = ruler.bearing(points[i], points[i + 1]);
        assertErr(t, expected, actual, 0.005, 'bearing');
    }
    t.pass('bearing within 0.05%');
    t.end();
});

test('bearing over dateline', (t) => {
    const p0 = [179.9, 32.7];
    const p1 = [-179.9, 32.9];
    const expected = turf.bearing(turf.point(p0), turf.point(p1));
    const actual = ruler.bearing(p0, p1);
    assertErr(t, expected, actual, 0.005, 'bearing');
    t.pass('bearing within 0.5%');
    t.end();
});

test('destination', (t) => {
    for (let i = 0; i < points.length; i++) {
        const bearing = (i % 360) - 180;
        const expected = turf.destination(turf.point(points[i]), 1.0, bearing, {units: 'kilometers'}).geometry.coordinates;
        const actual = ruler.destination(points[i], 1.0, bearing);
        assertErr(t, expected[0], actual[0], 1e-6, 'destination longitude');
        assertErr(t, expected[1], actual[1], 1e-6, 'destination latitude');
    }
    t.pass('destination within 1e-6');
    t.end();
});

test('lineDistance', (t) => {
    for (let i = 0; i < lines.length; i++) {
        const expected = turf.lineDistance(turf.lineString(lines[i]));
        const actual = ruler.lineDistance(lines[i]);
        assertErr(t, expected, actual, 0.003, 'lineDistance');
    }
    t.pass('lineDistance within 0.3%');
    t.end();
});

test('area', (t) => {
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].length < 3) continue;
        const poly = turf.polygon([lines[i].concat([lines[i][0]])]);
        const expected = turf.area(poly) / 1e6;
        const actual = ruler.area([lines[i]]);
        assertErr(t, expected, actual, 0.003, 'area');
    }
    t.pass('area within 0.3%');
    t.end();
});

test('along', (t) => {
    for (let i = 0; i < lines.length; i++) {
        const line = turf.lineString(lines[i]);
        const dist = turf.lineDistance(line) / 2;
        const expected = turf.along(line, dist, {units: 'kilometers'}).geometry.coordinates;
        const actual = ruler.along(lines[i], dist);
        assertErr(t, expected[0], actual[0], 1e-6, 'along longitude');
        assertErr(t, expected[1], actual[1], 1e-6, 'along latitude');
    }
    t.pass('along point within 1e-6');
    t.end();
});

test('along with dist <= 0', (t) => {
    t.same(ruler.along(lines[0], -5), lines[0][0], 'first point');
    t.end();
});

test('along with dist > length', (t) => {
    t.same(ruler.along(lines[0], 1000), lines[0][lines[0].length - 1], 'last point');
    t.end();
});

test('along over dateline', (t) => {
    const line = [[179.9, 32.7], [-179.9, 32.9]];
    const turfLine = turf.lineString(line);
    const dist = turf.lineDistance(turfLine) / 3;
    const expected = turf.along(turfLine, dist).geometry.coordinates;
    const actual = ruler.along(line, dist);

    t.ok(ruler.distance(expected, actual) < 0.02);
    t.end();
});

test('pointOnLine', (t) => {
    // not Turf comparison because pointOnLine is bugged https://github.com/Turfjs/turf/issues/344
    const line = [[-77.031669, 38.878605], [-77.029609, 38.881946]];
    const result = ruler.pointOnLine(line, [-77.034076, 38.882017]);

    t.same(result, {point: [-77.03052689033436, 38.880457324462576], index: 0, t: 0.5544221677861756}, 'pointOnLine');

    t.equal(ruler.pointOnLine(line, [-80, 38]).t, 0, 't is not less than 0');
    t.equal(ruler.pointOnLine(line, [-75, 38]).t, 1, 't is not bigger than 1');

    t.end();
});

test('pointOnLine over dateline', (t) => {
    const line = [[179.9, 32.7], [-179.9, 32.9]];
    const actual = ruler.pointOnLine(line, [180, 32.7]);
    t.same(actual.point, [179.9416136283502, 32.7416136283502]);
    t.end();
});

test('lineSlice', (t) => {
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const dist = ruler.lineDistance(line);
        const start = ruler.along(line, dist * 0.3);
        const stop = ruler.along(line, dist * 0.7);

        const expected = ruler.lineDistance(turf.lineSlice(
            turf.point(start), turf.point(stop), turf.lineString(line)).geometry.coordinates);

        const actual = ruler.lineDistance(ruler.lineSlice(start, stop, line));

        assertErr(t, expected, actual, 1e-5, 'lineSlice length');
    }
    t.pass('lineSlice length within 1e-5');
    t.end();
});

test('lineSliceAlong', (t) => {
    for (let i = 0; i < lines.length; i++) {
        if (i === 46) continue; // skip due to Turf bug https://github.com/Turfjs/turf/issues/351

        const line = lines[i];
        const dist = ruler.lineDistance(line);
        const start = ruler.along(line, dist * 0.3);
        const stop = ruler.along(line, dist * 0.7);

        const expected = ruler.lineDistance(turf.lineSlice(
            turf.point(start), turf.point(stop), turf.lineString(line)).geometry.coordinates);
        const actual = ruler.lineDistance(ruler.lineSliceAlong(dist * 0.3, dist * 0.7, line));

        assertErr(t, expected, actual, 1e-5, 'lineSliceAlong length');
    }
    t.pass('lineSliceAlong length within 1e-5');
    t.end();
});

test('lineSlice reverse', (t) => {
    const line = lines[0];
    const dist = ruler.lineDistance(line);
    const start = ruler.along(line, dist * 0.7);
    const stop = ruler.along(line, dist * 0.3);
    const actual = ruler.lineDistance(ruler.lineSlice(start, stop, line));
    t.equal(actual, 0.018676476689649835, 'lineSlice reversed length');
    t.end();
});

test('bufferPoint', (t) => {
    for (let i = 0; i < points.length; i++) {
        const expected = turfPointBuffer(points[i], 0.1);
        const actual = milesRuler.bufferPoint(points[i], 0.1);
        assertErr(t, expected[0], actual[0], 2e-7, 'bufferPoint west');
        assertErr(t, expected[1], actual[1], 2e-7, 'bufferPoint east');
        assertErr(t, expected[2], actual[2], 2e-7, 'bufferPoint south');
        assertErr(t, expected[3], actual[3], 2e-7, 'bufferPoint north');
    }
    t.pass('point buffer error within 2e-7');
    t.end();
});

test('bufferBBox', (t) => {
    const bbox = [30, 38, 40, 39];
    const bbox2 = ruler.bufferBBox(bbox, 1);
    t.same(bbox2, [29.989319282570946, 37.99098299160844, 40.010680717429054, 39.00901700839156], 'bufferBBox');
    t.end();
});

test('insideBBox', (t) => {
    const bbox = [30, 38, 40, 39];
    t.ok(ruler.insideBBox([35, 38.5], bbox), 'insideBBox inside');
    t.notOk(ruler.insideBBox([45, 45], bbox), 'insideBBox outside');
    t.end();
});

test('insideBBox over dateline', (t) => {
    t.ok(ruler.insideBBox([180, 32.8], [179.9, 32.7, -179.9, 32.9]));
    t.end();
});

test('cheapRuler.fromTile', (t) => {
    const ruler1 = new CheapRuler(50.5);
    const ruler2 = CheapRuler.fromTile(11041, 15);

    const p1 = [30.5, 50.5];
    const p2 = [30.51, 50.51];

    assertErr(t, ruler1.distance(p1, p2), ruler2.distance(p1, p2), 2e-5, 'cheapRuler.fromTile distance');

    t.end();
});

test('cheapRuler.units', (t) => {
    t.equal(CheapRuler.units.kilometers, 1);
    t.end();
});

function turfPointBuffer(p, distance) {
    const dist = Math.sqrt(2) * distance;
    const pt = turf.point(p);
    const sw = turf.destination(pt, dist, -135, {units: 'miles'});
    const ne = turf.destination(pt, dist, 45, {units: 'miles'});
    return sw.geometry.coordinates.concat(ne.geometry.coordinates);
}
