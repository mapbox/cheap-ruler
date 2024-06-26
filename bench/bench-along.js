
import runBench from './bench-run.js';
import CheapRuler from '../index.js';
import * as turf from '@turf/turf';
import {readFileSync} from 'fs';

const lines = JSON.parse(readFileSync(new URL('../test/fixtures/lines.json', import.meta.url)));

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
