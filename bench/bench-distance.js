'use strict';

const runBench = require('./bench-run.js');

const CheapRuler = require('../');
const turf = require('@turf/turf');
const lines = require('../test/fixtures/lines.json');

runBench({
    'turf.lineDistance'() {
        for (let i = 0; i < lines.length; i++) {
            turf.lineDistance(turf.lineString(lines[i]));
        }
    },
    'ruler.lineDistance'() {
        const ruler = new CheapRuler(32.8351);
        for (let i = 0; i < lines.length; i++) {
            ruler.lineDistance(lines[i]);
        }
    },
    'new ruler for every point'() {
        for (let i = 0; i < lines.length; i++) {
            var sum = 0; // eslint-disable-line
            for (let j = 0; j < lines[i].length - 1; j++) {
                const p1 = lines[i][j];
                const p2 = lines[i][j + 1];
                sum += new CheapRuler((p1[1] + p2[1]) / 2).distance(p1, p2);
            }
        }
    }
});
