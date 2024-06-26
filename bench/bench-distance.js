import runBench from './bench-run.js';
import CheapRuler from '../index.js';
import * as turf from '@turf/turf';
import {readFileSync} from 'fs';

const lines = JSON.parse(readFileSync(new URL('../test/fixtures/lines.json', import.meta.url)));

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
            let sum = 0;
            for (let j = 0; j < lines[i].length - 1; j++) {
                const p1 = lines[i][j];
                const p2 = lines[i][j + 1];
                sum += new CheapRuler((p1[1] + p2[1]) / 2).distance(p1, p2); // eslint-disable-line
            }
        }
    }
});
