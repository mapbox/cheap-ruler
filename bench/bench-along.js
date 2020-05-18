'use strict';

const runBench = require('./bench-run.js');

const CheapRuler = require('../');
const turf = require('@turf/turf');
const lines = require('../test/fixtures/lines.json');

const ruler = new CheapRuler(32.8351);

const distances = lines.map(line => ruler.lineDistance(line));

runBench({
    'turf.along'() {
        const options = {units: 'kilometers'};
        for (let i = 0; i < lines.length; i++) {
            turf.along(turf.lineString(lines[i]), distances[i], options);
        }
    },
    'ruler.along'() {
        const ruler = new CheapRuler(32.8351);
        for (let i = 0; i < lines.length; i++) {
            ruler.along(lines[i], distances[i]);
        }
    }
});
