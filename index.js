'use strict'; /* @flow */

module.exports = cheapRuler;

/**
 * A collection of very fast approximations to common geodesic measurements. Useful for performance-sensitive code that measures things on a city scale.
 *
 * @param {number} lat latitude
 * @param {string} [units='kilometers']
 * @returns {CheapRuler}
 * @example
 * var ruler = cheapRuler(35.05, 'miles');
 * //=ruler
 */
function cheapRuler(lat /*: number */, units /*: ?string */) {
    return new CheapRuler(lat, units);
}

/**
 * Multipliers for converting between units.
 *
 * @example
 * // convert 50 meters to yards
 * 50 * cheapRuler.units.yards / cheapRuler.units.meters;
 */
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

/**
 * Creates a ruler object from tile coordinates (y and z). Convenient in tile-reduce scripts.
 *
 * @param {number} y
 * @param {number} z
 * @param {string} [units='kilometers']
 * @returns {CheapRuler}
 * @example
 * var ruler = cheapRuler.fromTile(1567, 12);
 * //=ruler
 */
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

    // multipliers for converting longitude and latitude degrees into distance (http://1.usa.gov/1Wb1bv7)
    this.kx = m * (111.41513 * cos - 0.09455 * cos3 + 0.00012 * cos5);
    this.ky = m * (111.13209 - 0.56605 * cos2 + 0.0012 * cos4);
}

CheapRuler.prototype = {
    /**
     * Given two points of the form [longitude, latitude], returns the distance.
     *
     * @param {Array<number>} a point [longitude, latitude]
     * @param {Array<number>} b point [longitude, latitude]
     * @returns {number} distance
     * @example
     * var distance = ruler.distance([30.5, 50.5], [30.51, 50.49]);
     * //=distance
     */
    distance: function (a, b) {
        var dx = (a[0] - b[0]) * this.kx;
        var dy = (a[1] - b[1]) * this.ky;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Returns the bearing between two points in angles.
     *
     * @param {Array<number>} a point [longitude, latitude]
     * @param {Array<number>} b point [longitude, latitude]
     * @returns {number} bearing
     * @example
     * var bearing = ruler.bearing([30.5, 50.5], [30.51, 50.49]);
     * //=bearing
     */
    bearing: function (a, b) {
        var dx = (b[0] - a[0]) * this.kx;
        var dy = (b[1] - a[1]) * this.ky;
        if (!dx && !dy) return 0;
        var bearing = Math.atan2(-dy, dx) * 180 / Math.PI + 90;
        if (bearing > 180) bearing -= 360;
        return bearing;
    },

    /**
     * Returns a new point given distance and bearing from the starting point.
     *
     * @param {Array<number>} p point [longitude, latitude]
     * @param {number} dist distance
     * @param {number} bearing
     * @returns {Array<number>} point [longitude, latitude]
     * @example
     * var point = ruler.destination([30.5, 50.5], 0.1, 90);
     * //=point
     */
    destination: function (p, dist, bearing) {
        var a = (90 - bearing) * Math.PI / 180;
        return this.offset(p,
            Math.cos(a) * dist,
            Math.sin(a) * dist);
    },

    /**
     * Returns a new point given easting and northing offsets (in ruler units) from the starting point.
     *
     * @param {Array<number>} p point [longitude, latitude]
     * @param {number} dx easting
     * @param {number} dy northing
     * @returns {Array<number>} point [longitude, latitude]
     * @example
     * var point = ruler.offset([30.5, 50.5], 10, 10);
     * //=point
     */
    offset: function (p, dx, dy) {
        return [
            p[0] + dx / this.kx,
            p[1] + dy / this.ky
        ];
    },

    /**
     * Given a line (an array of points), returns the total line distance.
     *
     * @param {Array<Array<number>>} points [longitude, latitude]
     * @returns {number} total line distance
     * @example
     * var length = ruler.lineDistance([
     *     [-67.031, 50.458], [-67.031, 50.534],
     *     [-66.929, 50.534], [-66.929, 50.458]
     * ]);
     * //=length
     */
    lineDistance: function (points) {
        var total = 0;
        for (var i = 0; i < points.length - 1; i++) {
            total += this.distance(points[i], points[i + 1]);
        }
        return total;
    },

    /**
     * Given a polygon (an array of rings, where each ring is an array of points), returns the area.
     *
     * @param {Array<Array<Array<number>>>} polygon
     * @returns {number} area value in the specified units (square kilometers by default)
     * @example
     * var area = ruler.area([[
     *     [-67.031, 50.458], [-67.031, 50.534], [-66.929, 50.534],
     *     [-66.929, 50.458], [-67.031, 50.458]
     * ]]);
     * //=area
     */
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

    /**
     * Returns the point at a specified distance along the line.
     *
     * @param {Array<Array<number>>} line
     * @param {number} dist distance
     * @returns {Array<number>} point [longitude, latitude]
     * @example
     * var point = ruler.along(line, 2.5);
     * //=point
     */
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

    /**
     * Returns an object of the form {point, index} where point is closest point on the line from the given point, and index is the start index of the segment with the closest point.
     *
     * @pointOnLine
     * @param {Array<Array<number>>} line
     * @param {Array<number>} p point [longitude, latitude]
     * @returns {Object} {point, index}
     * @example
     * var point = ruler.pointOnLine(line, [-67.04, 50.5]).point;
     * //=point
     */
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

    /**
     * Returns a part of the given line between the start and the stop points (or their closest points on the line).
     *
     * @param {Array<number>} start point [longitude, latitude]
     * @param {Array<number>} stop point [longitude, latitude]
     * @param {Array<Array<number>>} line
     * @returns {Array<Array<number>>} line part of a line
     * @example
     * var line2 = ruler.lineSlice([-67.04, 50.5], [-67.05, 50.56], line1);
     * //=line2
     */
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

    /**
     * Returns a part of the given line between the start and the stop points indicated by distance along the line.
     *
     * @param {number} start distance
     * @param {number} stop distance
     * @param {Array<Array<number>>} line
     * @returns {Array<Array<number>>} line part of a line
     * @example
     * var line2 = ruler.lineSliceAlong(10, 20, line1);
     * //=line2
     */
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

    /**
     * Given a point, returns a bounding box object ([w, s, e, n]) created from the given point buffered by a given distance.
     *
     * @param {Array<number>} p point [longitude, latitude]
     * @param {number} buffer
     * @returns {Array<number>} box object ([w, s, e, n])
     * @example
     * var bbox = ruler.bufferPoint([30.5, 50.5], 0.01);
     * //=bbox
     */
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

    /**
     * Given a bounding box, returns the box buffered by a given distance.
     *
     * @param {Array<number>} box object ([w, s, e, n])
     * @param {number} buffer
     * @returns {Array<number>} box object ([w, s, e, n])
     * @example
     * var bbox = ruler.bufferBBox([30.5, 50.5, 31, 51], 0.2);
     * //=bbox
     */
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

    /**
     * Returns true if the given point is inside in the given bounding box, otherwise false.
     *
     * @param {Array<number>} p point [longitude, latitude]
     * @param {Array<number>} box object ([w, s, e, n])
     * @returns {boolean}
     * @example
     * var inside = ruler.insideBBox([30.5, 50.5], [30, 50, 31, 51]);
     * //=inside
     */
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
