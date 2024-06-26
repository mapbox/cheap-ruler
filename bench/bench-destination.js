import runBench from './bench-run.js';
import CheapRuler from '../index.js';
import * as turf from '@turf/turf';
import {readFileSync} from 'fs';

const lines = JSON.parse(readFileSync(new URL('../test/fixtures/lines.json', import.meta.url)));
const points = [].concat(...lines);

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
