'use strict';

var createRuler = require('../');
var vincenty = require('node-vincenty');

var distances = [1, 100, 300, 1000, 2000];
var angle = 45;
var precision = 1e3;

process.stdout.write('| lat | ');

for (var lat = 0; lat <= 80; lat += 10) {
    process.stdout.write(lat + '&deg; | ');
}

process.stdout.write('\n| --- | ');
for (lat = 0; lat <= 80; lat += 10) process.stdout.write(' --- |');
process.stdout.write('\n');

for (var i = 0; i < distances.length; i++) {
    var dist = distances[i];
    process.stdout.write('| ' + dist + 'mi | ');

    for (lat = 0; lat <= 80; lat += 10) {
        var ruler = createRuler(lat, 'miles');

        var p1 = ruler.destination([0, lat], dist / 2, angle);
        var p2 = ruler.destination([0, lat], dist / 2, angle - 180);

        var d = ruler.distance(p1, p2);
        // var d = turf.distance(turf.point(p1), turf.point(p2), 'miles');
        var d2 = createRuler.units.miles * vincenty.distVincenty(p1[1], p1[0], p2[1], p2[0]).distance / 1000;

        process.stdout.write((Math.round(100 * precision * Math.abs((d - d2) / d2)) / precision) + '% | ');
    }
    process.stdout.write('\n');
}
