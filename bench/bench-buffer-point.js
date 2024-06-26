import runBench from './bench-run.js';
import CheapRuler from '../index.js';
import * as turf from '@turf/turf';
import {readFileSync} from 'fs';

const lines = JSON.parse(readFileSync(new URL('../test/fixtures/lines.json', import.meta.url)));
const points = [].concat(...lines);

runBench({
    'turf.destination-based bbox'() {
        for (let i = 0; i < points.length; i++) {
            bboxBuffer(turf.point(points[i]), 0.01);
        }
    },
    'ruler.bufferPoint'() {
        const ruler = new CheapRuler(32.8351);
        for (let i = 0; i < points.length; i++) {
            ruler.bufferPoint(points[i], 0.01);
        }
    }
});

function bboxBuffer(pt, distance) {
    const sw = turf.destination(pt, distance, -135);
    const ne = turf.destination(pt, distance, 45);
    return sw.geometry.coordinates.concat(ne.geometry.coordinates);
}
