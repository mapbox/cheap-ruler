import runBench from './bench-run.js';
import CheapRuler from '../index.js';
import * as turf from '@turf/turf';
import {readFileSync} from 'fs';

const lines = JSON.parse(readFileSync(new URL('../test/fixtures/lines.json', import.meta.url)));
const points = [].concat(...lines);

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
