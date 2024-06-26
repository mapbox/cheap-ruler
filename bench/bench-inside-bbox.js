import runBench from './bench-run.js';
import CheapRuler from '../index.js';
import * as turf from '@turf/turf';
import {readFileSync} from 'fs';

const lines = JSON.parse(readFileSync(new URL('../test/fixtures/lines.json', import.meta.url)));
const points = [].concat(...lines);

const ruler = new CheapRuler(32.8351);
const bboxes = points.map(p => ruler.bufferPoint(p, 0.1));

runBench({
    'turf.inside + turf.bboxPolygon'() {
        for (let i = 0; i < points.length; i++) {
            turf.inside(turf.point(points[i]), turf.bboxPolygon(bboxes[i]));
        }
    },
    'ruler.insideBBox'() {
        const ruler = new CheapRuler(32.8351);
        for (let i = 0; i < points.length; i++) {
            ruler.insideBBox(points[i], bboxes[i]);
        }
    }
});
