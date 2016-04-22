'use strict';

module.exports = cheapRuler;

function cheapRuler(lat, units) {
    return new CheapRuler(lat, units);
}

cheapRuler.fromTile = function (y, z, units) {
    var n = Math.PI * (1 - 2 * (y + 0.5) / Math.pow(2, z));
    var lat = Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))) * 180 / Math.PI;
    return new CheapRuler(lat, units);
};

function CheapRuler(lat, units) {
    if (lat === undefined) throw new Error('No latitude given.');

    // units per degree on equator
    this.d = (units === 'miles' ? 24901.55 : 40075.16) / 360;

    // longitude correction based on latitude
    this.e = Math.cos(lat * Math.PI / 180);
}

CheapRuler.prototype = {
    distance: function (a, b) {
        var dx = (a[0] - b[0]) * this.e;
        var dy = a[1] - b[1];
        return Math.sqrt(dx * dx + dy * dy) * this.d;
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

        return (Math.abs(sum) / 2) * this.e * this.d * this.d;
    },

    bearing: function (a, b) {
        var dx = (b[0] - a[0]) * this.e;
        var dy = b[1] - a[1];
        if (!dx && !dy) return 0;
        var bearing = Math.atan2(-dy, dx) * 180 / Math.PI + 90;
        if (bearing > 180) bearing -= 360;
        return bearing;
    },

    bufferPoint: function (p, buffer) {
        var v = buffer / this.d;
        var h = v / this.e;
        return [
            p[0] - h,
            p[1] - v,
            p[0] + h,
            p[1] + v
        ];
    },

    bufferBBox: function (bbox, buffer) {
        var v = buffer / this.d;
        var h = v / this.e;
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
    },

    pointOnLine: function (line, p) {
        var minDist = Infinity;
        var minX, minY;

        for (var i = 0; i < line.length - 1; i++) {

            var x = line[i][0];
            var y = line[i][1];
            var dx = (line[i + 1][0] - x) * this.e;
            var dy = line[i + 1][1] - y;

            if (dx !== 0 || dy !== 0) {

                var t = ((p[0] - x) * this.e * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);

                if (t > 1) {
                    x = line[i + 1][0];
                    y = line[i + 1][1];

                } else if (t > 0) {
                    x += dx * t / this.e;
                    y += dy * t;
                }
            }

            dx = (p[0] - x) * this.e;
            dy = p[1] - y;

            var sqDist = dx * dx + dy * dy;
            if (sqDist < minDist) {
                minDist = sqDist;
                minX = x;
                minY = y;
            }
        }

        return [minX, minY];
    },

    along: function (line, dist) {
        var sum = 0;

        if (dist <= 0) return line[0];

        for (var i = 0; i < line.length - 1; i++) {
            var p0 = line[i];
            var p = line[i + 1];
            var d = this.distance(p0, p);

            sum += d;

            if (sum > dist) {
                var t = (dist - (sum - d)) / d;
                var dx = p[0] - p0[0];
                var dy = p[1] - p0[1];

                return [
                    p0[0] + dx * t,
                    p0[1] + dy * t
                ];
            }
        }

        return line[line.length - 1];
    },

    destination: function (p, dist, bearing) {
        var a = (90 - bearing) * Math.PI / 180;
        var d = dist / this.d;
        return [
            p[0] + d * Math.cos(a) / this.e,
            p[1] + d * Math.sin(a)
        ];
    }
};
