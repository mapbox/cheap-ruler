'use strict';

const runBench = require('./bench-run.js');

const CheapRuler = require('../');
const turf = require('@turf/turf');
const lines = require('../test/fixtures/lines.json');
const points = Array.prototype.concat.apply([], lines);

runBench({
    'turf.destination'() {
        for (let i = 0; i < points.length; i++) {
            turf.destination(turf.point(points[i]), 1, (i % 360) - 180, 'kilometers');
        }
    },
    'ruler.destination'() {
        const ruler = new CheapRuler(32.8351);
        for (let i = 0; i < points.length; i++) {
            ruler.destination(points[i], 1, (i % 360) - 180);
        }
    }
});
