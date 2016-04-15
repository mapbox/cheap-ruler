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
    }
};
