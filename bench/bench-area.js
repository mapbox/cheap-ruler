import runBench from './bench-run.js';
import CheapRuler from '../index.js';
import * as turf from '@turf/turf';
import {readFileSync} from 'fs';

const lines = JSON.parse(readFileSync(new URL('../test/fixtures/lines.json', import.meta.url)));

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
