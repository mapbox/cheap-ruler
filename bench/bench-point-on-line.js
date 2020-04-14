'use strict';

const runBench = require('./bench-run.js');

const CheapRuler = require('../');
const turf = require('@turf/turf');
const lines = require('../test/fixtures/lines.json');

const p = [-96.9159, 32.8351];

runBench({
    'turf.pointOnLine'() {
        for (let i = 0; i < lines.length; i++) {
            turf.pointOnLine(turf.lineString(lines[i]), turf.point(p));
        }
    },
    'ruler.pointOnLine'() {
        const ruler = new CheapRuler(32.8351);
        for (let i = 0; i < lines.length; i++) {
            ruler.pointOnLine(lines[i], p);
        }
    }
});
