const createRuler = require('../');
const vincenty = require('node-vincenty');

const distances = [1, 100, 300, 1000, 2000];
const angle = 45;
const precision = 1e3;

process.stdout.write('| lat | ');

for (let lat = 0; lat <= 80; lat += 10) {
    process.stdout.write(`${lat}&deg; | `);
}

process.stdout.write('\n| --- | ');
for (let lat = 0; lat <= 80; lat += 10) process.stdout.write(' --- |');
process.stdout.write('\n');

for (let i = 0; i < distances.length; i++) {
    const dist = distances[i];
    process.stdout.write(`| ${dist}mi | `);

    for (let lat = 0; lat <= 80; lat += 10) {
        const ruler = createRuler(lat, 'miles');

        const p1 = ruler.destination([0, lat], dist / 2, angle);
        const p2 = ruler.destination([0, lat], dist / 2, angle - 180);

        const d = ruler.distance(p1, p2);
        // var d = turf.distance(turf.point(p1), turf.point(p2), 'miles');
        const d2 = createRuler.units.miles * vincenty.distVincenty(p1[1], p1[0], p2[1], p2[0]).distance / 1000;

        process.stdout.write(`${Math.round(100 * precision * Math.abs((d - d2) / d2)) / precision}% | `);
    }
    process.stdout.write('\n');
}
