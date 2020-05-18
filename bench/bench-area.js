'use strict';

const runBench = require('./bench-run.js');

const CheapRuler = require('../');
const turf = require('@turf/turf');
const lines = require('../test/fixtures/lines.json');

const polygons = [];

for (let i = 0; i < lines.length; i++) {
    if (lines[i].length >= 3) {
        polygons.push([lines[i].concat([lines[i][0]])]);
    }
}

runBench({
    'turf.area'() {
        for (let i = 0; i < polygons.length; i++) {
            turf.area(turf.polygon(polygons[i]));
        }
    },
    'ruler.area'() {
        const ruler = new CheapRuler(32.8351);
        for (let i = 0; i < polygons.length; i++) {
            ruler.area(polygons[i]);
        }
    }
});
