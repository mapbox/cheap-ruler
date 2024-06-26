import runBench from './bench-run.js';
import CheapRuler from '../index.js';
import * as turf from '@turf/turf';
import {readFileSync} from 'fs';

const lines = JSON.parse(readFileSync(new URL('../test/fixtures/lines.json', import.meta.url)));

const ruler = new CheapRuler(32.8351);
const distances = lines.map(line => ruler.lineDistance(line));

runBench({
    'turf.along + turf.lineSlice'() {
        for (let i = 0; i < lines.length; i++) {
            const feature = turf.lineString(lines[i]);
            turf.lineSlice(
                turf.along(feature, distances[i] * 0.3),
                turf.along(feature, distances[i] * 0.7),
                turf.lineString(lines[i]));
        }
    },
    'ruler.lineSliceAlong'() {
        const ruler = new CheapRuler(32.8351);
        for (let i = 0; i < lines.length; i++) {
            ruler.lineSliceAlong(distances[i] * 0.3, distances[i] * 0.7, lines[i]);
        }
    }
});
