import runBench from './bench-run.js';
import CheapRuler from '../index.js';
import * as turf from '@turf/turf';
import {readFileSync} from 'fs';

const lines = JSON.parse(readFileSync(new URL('../test/fixtures/lines.json', import.meta.url)));

const p = [-96.9159, 32.8351];

runBench({
    'turf.nearestPointOnLine'() {
        for (let i = 0; i < lines.length; i++) {
            turf.nearestPointOnLine(turf.lineString(lines[i]), turf.point(p));
        }
    },
    'ruler.pointOnLine'() {
        const ruler = new CheapRuler(32.8351);
        for (let i = 0; i < lines.length; i++) {
            ruler.pointOnLine(lines[i], p);
        }
    }
});
