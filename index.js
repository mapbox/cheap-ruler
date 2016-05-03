'use strict'; /* @flow */

module.exports = cheapRuler;

function cheapRuler(lat /*: number */, units /*: ?string */) {
    return new CheapRuler(lat, units);
}

// unit multipliers for conversion from kilometers
var factors = cheapRuler.units = {
    kilometers: 1,
    miles: 1000 / 1609.344,
    nauticalmiles: 1000 / 1852,
    meters: 1000,
    metres: 1000,
    yards: 1000 / 0.9144,
    feet: 1000 / 0.3048,
    inches: 1000 / 0.0254
};

cheapRuler.fromTile = function (y, z, units) {
    var n = Math.PI * (1 - 2 * (y + 0.5) / Math.pow(2, z));
    var lat = Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))) * 180 / Math.PI;
    return new CheapRuler(lat, units);
};

function CheapRuler(lat, units) {
    if (lat === undefined) throw new Error('No latitude given.');
    if (units && !factors[units]) throw new Error('Unknown unit ' + units + '. Use one of: ' + Object.keys(factors));

    var m = units ? factors[units] : 1;

    var cos = Math.cos(lat * Math.PI / 180);
    var cos2 = 2 * cos * cos - 1;
    var cos3 = 2 * cos * cos2 - cos;
    var cos4 = 2 * cos * cos3 - cos2;
    var cos5 = 2 * cos * cos4 - cos3;

    this.kx = m * (111.41513 * cos - 0.09455 * cos3 + 0.00012 * cos5); // longitude correction
    this.ky = m * (111.13209 - 0.56605 * cos2 + 0.0012 * cos4);        // latitude correction
}

CheapRuler.prototype = {
    distance: function (a, b) {
        var dx = (a[0] - b[0]) * this.kx;
        var dy = (a[1] - b[1]) * this.ky;
        return Math.sqrt(dx * dx + dy * dy);
    },

    bearing: function (a, b) {
        var dx = (b[0] - a[0]) * this.kx;
        var dy = (b[1] - a[1]) * this.ky;
        if (!dx && !dy) return 0;
        var bearing = Math.atan2(-dy, dx) * 180 / Math.PI + 90;
        if (bearing > 180) bearing -= 360;
        return bearing;
    },

    destination: function (p, dist, bearing) {
        var a = (90 - bearing) * Math.PI / 180;
        return [
            p[0] + Math.cos(a) * dist / this.kx,
            p[1] + Math.sin(a) * dist / this.ky
        ];
    },

    lineDistance: function (points) {
        var total = 0;
        for (var i = 0; i < points.length - 1; i++) {
            total += this.distance(points[i], points[i + 1]);
        }
        return total;
    },

    area: function (polygon) {
        var sum = 0;

        for (var i = 0; i < polygon.length; i++) {
            var ring = polygon[i];

            for (var j = 0, len = ring.length, k = len - 1; j < len; k = j++) {
                sum += (ring[j][0] - ring[k][0]) * (ring[j][1] + ring[k][1]) * (i ? -1 : 1);
            }
        }

        return (Math.abs(sum) / 2) * this.kx * this.ky;
    },

    along: function (line, dist) {
        var sum = 0;

        if (dist <= 0) return line[0];

        for (var i = 0; i < line.length - 1; i++) {
            var p0 = line[i];
            var p1 = line[i + 1];
            var d = this.distance(p0, p1);
            sum += d;
            if (sum > dist) return interpolate(p0, p1, (dist - (sum - d)) / d);
        }

        return line[line.length - 1];
    },

    pointOnLine: function (line, p) {
        var minDist = Infinity;
        var minX, minY, minI, minT;

        for (var i = 0; i < line.length - 1; i++) {

            var x = line[i][0];
            var y = line[i][1];
            var dx = (line[i + 1][0] - x) * this.kx;
            var dy = (line[i + 1][1] - y) * this.ky;

            if (dx !== 0 || dy !== 0) {

                var t = ((p[0] - x) * this.kx * dx + (p[1] - y) * this.ky * dy) / (dx * dx + dy * dy);

                if (t > 1) {
                    x = line[i + 1][0];
                    y = line[i + 1][1];

                } else if (t > 0) {
                    x += (dx / this.kx) * t;
                    y += (dy / this.ky) * t;
                }
            }

            dx = (p[0] - x) * this.kx;
            dy = (p[1] - y) * this.ky;

            var sqDist = dx * dx + dy * dy;
            if (sqDist < minDist) {
                minDist = sqDist;
                minX = x;
                minY = y;
                minI = i;
                minT = t;
            }
        }

        return {
            point: [minX, minY],
            index: minI,
            t: minT
        };
    },

    lineSlice: function (start, stop, line) {
        var p1 = this.pointOnLine(line, start);
        var p2 = this.pointOnLine(line, stop);

        if (p1.index > p2.index || (p1.index === p2.index && p1.t > p2.t)) {
            var tmp = p1;
            p1 = p2;
            p2 = tmp;
        }

        var slice = [p1.point];

        var l = p1.index + 1;
        var r = p2.index;

        if (!equals(line[l], slice[0]) && l <= r)
            slice.push(line[l]);

        for (var i = l + 1; i <= r; i++) {
            slice.push(line[i]);
        }

        if (!equals(line[r], p2.point))
            slice.push(p2.point);

        return slice;
    },

    lineSliceAlong: function (start, stop, line) {
        var sum = 0;
        var slice = [];

        for (var i = 0; i < line.length - 1; i++) {
            var p0 = line[i];
            var p1 = line[i + 1];
            var d = this.distance(p0, p1);

            sum += d;

            if (sum > start && slice.length === 0) {
                slice.push(interpolate(p0, p1, (start - (sum - d)) / d));
            }

            if (sum >= stop) {
                slice.push(interpolate(p0, p1, (stop - (sum - d)) / d));
                return slice;
            }

            if (sum > start) slice.push(p1);
        }

        return slice;
    },

    bufferPoint: function (p, buffer) {
        var v = buffer / this.ky;
        var h = buffer / this.kx;
        return [
            p[0] - h,
            p[1] - v,
            p[0] + h,
            p[1] + v
        ];
    },

    bufferBBox: function (bbox, buffer) {
        var v = buffer / this.ky;
        var h = buffer / this.kx;
        return [
            bbox[0] - h,
            bbox[1] - v,
            bbox[2] + h,
            bbox[3] + v
        ];
    },

    insideBBox: function (p, bbox) {
        return p[0] >= bbox[0] &&
               p[0] <= bbox[2] &&
               p[1] >= bbox[1] &&
               p[1] <= bbox[3];
    }
};

function equals(a, b) {
    return a[0] === b[0] && a[1] === b[1];
}

function interpolate(a, b, t) {
    var dx = b[0] - a[0];
    var dy = b[1] - a[1];
    return [
        a[0] + dx * t,
        a[1] + dy * t
    ];
}
