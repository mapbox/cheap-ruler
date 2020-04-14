'use strict';

const runBench = require('./bench-run.js');

const CheapRuler = require('../');
const turf = require('@turf/turf');
const lines = require('../test/fixtures/lines.json');
const points = Array.prototype.concat.apply([], lines);

const ruler = new CheapRuler(32.8351);
const bboxes = points.map(p => ruler.bufferPoint(p, 0.1));

runBench({
    'turf.inside + turf.bboxPolygon'() {
        for (let i = 0; i < points.length; i++) {
            turf.inside(turf.point(points[i]), turf.bboxPolygon(bboxes[i]));
        }
    },
    'ruler.insideBBox'() {
        const ruler = new CheapRuler(32.8351);
        for (let i = 0; i < points.length; i++) {
            ruler.insideBBox(points[i], bboxes[i]);
        }
    }
});
