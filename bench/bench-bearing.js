'use strict';

const runBench = require('./bench-run.js');

const CheapRuler = require('../');
const turf = require('@turf/turf');
const lines = require('../test/fixtures/lines.json');
const points = Array.prototype.concat.apply([], lines);

runBench({
    'turf.bearing'() {
        for (let i = 0; i < points.length - 1; i++) {
            turf.bearing(turf.point(points[i]), turf.point(points[i + 1]));
        }
    },
    'ruler.bearing'() {
        const ruler = new CheapRuler(32.8351);
        for (let i = 0; i < points.length - 1; i++) {
            ruler.bearing(points[i], points[i + 1]);
        }
    }
});
