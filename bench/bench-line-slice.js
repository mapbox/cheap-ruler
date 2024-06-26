import runBench from './bench-run.js';
import CheapRuler from '../index.js';
import * as turf from '@turf/turf';
import {readFileSync} from 'fs';

const lines = JSON.parse(readFileSync(new URL('../test/fixtures/lines.json', import.meta.url)));

const ruler = new CheapRuler(32.8351);

const endpoints = lines.map((line) => {
    const dist = ruler.lineDistance(line);
    return {
        start: ruler.along(line, dist * 0.3),
        stop: ruler.along(line, dist * 0.7)
    };
});

runBench({
    'turf.lineSlice'() {
        for (let i = 0; i < lines.length; i++) {
            turf.lineSlice(
                turf.point(endpoints[i].start),
                turf.point(endpoints[i].stop),
                turf.lineString(lines[i]));
        }
    },
    'ruler.lineSlice'() {
        const ruler = new CheapRuler(32.8351);
        for (let i = 0; i < lines.length; i++) {
            ruler.lineSlice(endpoints[i].start, endpoints[i].stop, lines[i]);
        }
    }
});
