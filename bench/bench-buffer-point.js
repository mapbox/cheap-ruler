'use strict';

const runBench = require('./bench-run.js');

const CheapRuler = require('../');
const turf = require('@turf/turf');
const lines = require('../test/fixtures/lines.json');
const points = Array.prototype.concat.apply([], lines);

runBench({
    'turf.destination-based bbox'() {
        for (let i = 0; i < points.length; i++) {
            bboxBuffer(turf.point(points[i]), 0.01);
        }
    },
    'ruler.bufferPoint'() {
        const ruler = new CheapRuler(32.8351);
        for (let i = 0; i < points.length; i++) {
            ruler.bufferPoint(points[i], 0.01);
        }
    }
});

function bboxBuffer(pt, distance) {
    const sw = turf.destination(pt, distance, -135);
    const ne = turf.destination(pt, distance, 45);
    return sw.geometry.coordinates.concat(ne.geometry.coordinates);
}
