'use strict'; /* @flow */

const factors = {
    kilometers: 1,
    miles: 1000 / 1609.344,
    nauticalmiles: 1000 / 1852,
    meters: 1000,
    metres: 1000,
    yards: 1000 / 0.9144,
    feet: 1000 / 0.3048,
    inches: 1000 / 0.0254
};

// Values that define WGS84 ellipsoid model of the Earth
const RE = 6378.137; // equatorial radius
const FE = 1 / 298.257223563; // flattening

const E2 = FE * (2 - FE);
const RAD = Math.PI / 180;

/**
 * A collection of very fast approximations to common geodesic measurements. Useful for performance-sensitive code that measures things on a city scale.
 *
 * @param {number} lat latitude
 * @param {string} [units='kilometers']
 * @returns {CheapRuler}
 * @example
 * const ruler = cheapRuler(35.05, 'miles');
 * //=ruler
 */
export default class CheapRuler {
    /**
     * Creates a ruler object from tile coordinates (y and z).
     *
     * @param {number} y
     * @param {number} z
     * @param {string} [units='kilometers']
     * @returns {CheapRuler}
     * @example
     * const ruler = cheapRuler.fromTile(1567, 12);
     * //=ruler
     */
    static fromTile(y, z, units) {
        const n = Math.PI * (1 - 2 * (y + 0.5) / Math.pow(2, z));
        const lat = Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))) / RAD;
        return new CheapRuler(lat, units);
    }

    /**
     * Multipliers for converting between units.
     *
     * @example
     * // convert 50 meters to yards
     * 50 * CheapRuler.units.yards / CheapRuler.units.meters;
     */
    static get units() {
        return factors;
    }

    /**
     * Creates a ruler instance for very fast approximations to common geodesic measurements around a certain latitude.
     *
     * @param {number} lat latitude
     * @param {string} [units='kilometers']
     * @returns {CheapRuler}
     * @example
     * const ruler = cheapRuler(35.05, 'miles');
     * //=ruler
     */
    constructor(lat, units) {
        if (lat === undefined) throw new Error('No latitude given.');
        if (units && !factors[units]) throw new Error(`Unknown unit ${  units  }. Use one of: ${  Object.keys(factors).join(', ')}`);

        // Curvature formulas from https://en.wikipedia.org/wiki/Earth_radius#Meridional
        const m = RAD * RE * (units ? factors[units] : 1);
        const coslat = Math.cos(lat * RAD);
        const w2 = 1 / (1 - E2 * (1 - coslat * coslat));
        const w = Math.sqrt(w2);

        // multipliers for converting longitude and latitude degrees into distance
        this.kx = m * w * coslat;        // based on normal radius of curvature
        this.ky = m * w * w2 * (1 - E2); // based on meridonal radius of curvature
    }

    /**
     * Given two points of the form [longitude, latitude], returns the distance.
     *
     * @param {Array<number>} a point [longitude, latitude]
     * @param {Array<number>} b point [longitude, latitude]
     * @returns {number} distance
     * @example
     * const distance = ruler.distance([30.5, 50.5], [30.51, 50.49]);
     * //=distance
     */
    distance(a, b) {
        const dx = wrap(a[0] - b[0]) * this.kx;
        const dy = (a[1] - b[1]) * this.ky;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Returns the bearing between two points in angles.
     *
     * @param {Array<number>} a point [longitude, latitude]
     * @param {Array<number>} b point [longitude, latitude]
     * @returns {number} bearing
     * @example
     * const bearing = ruler.bearing([30.5, 50.5], [30.51, 50.49]);
     * //=bearing
     */
    bearing(a, b) {
        const dx = wrap(b[0] - a[0]) * this.kx;
        const dy = (b[1] - a[1]) * this.ky;
        return Math.atan2(dx, dy) / RAD;
    }

    /**
     * Returns a new point given distance and bearing from the starting point.
     *
     * @param {Array<number>} p point [longitude, latitude]
     * @param {number} dist distance
     * @param {number} bearing
     * @returns {Array<number>} point [longitude, latitude]
     * @example
     * const point = ruler.destination([30.5, 50.5], 0.1, 90);
     * //=point
     */
    destination(p, dist, bearing) {
        const a = bearing * RAD;
        return this.offset(p,
            Math.sin(a) * dist,
            Math.cos(a) * dist);
    }

    /**
     * Returns a new point given easting and northing offsets (in ruler units) from the starting point.
     *
     * @param {Array<number>} p point [longitude, latitude]
     * @param {number} dx easting
     * @param {number} dy northing
     * @returns {Array<number>} point [longitude, latitude]
     * @example
     * const point = ruler.offset([30.5, 50.5], 10, 10);
     * //=point
     */
    offset(p, dx, dy) {
        return [
            p[0] + dx / this.kx,
            p[1] + dy / this.ky
        ];
    }

    /**
     * Given a line (an array of points), returns the total line distance.
     *
     * @param {Array<Array<number>>} points [longitude, latitude]
     * @returns {number} total line distance
     * @example
     * const length = ruler.lineDistance([
     *     [-67.031, 50.458], [-67.031, 50.534],
     *     [-66.929, 50.534], [-66.929, 50.458]
     * ]);
     * //=length
     */
    lineDistance(points) {
        let total = 0;
        for (let i = 0; i < points.length - 1; i++) {
            total += this.distance(points[i], points[i + 1]);
        }
        return total;
    }

    /**
     * Given a polygon (an array of rings, where each ring is an array of points), returns the area.
     *
     * @param {Array<Array<Array<number>>>} polygon
     * @returns {number} area value in the specified units (square kilometers by default)
     * @example
     * const area = ruler.area([[
     *     [-67.031, 50.458], [-67.031, 50.534], [-66.929, 50.534],
     *     [-66.929, 50.458], [-67.031, 50.458]
     * ]]);
     * //=area
     */
    area(polygon) {
        let sum = 0;

        for (let i = 0; i < polygon.length; i++) {
            const ring = polygon[i];

            for (let j = 0, len = ring.length, k = len - 1; j < len; k = j++) {
                sum += wrap(ring[j][0] - ring[k][0]) * (ring[j][1] + ring[k][1]) * (i ? -1 : 1);
            }
        }

        return (Math.abs(sum) / 2) * this.kx * this.ky;
    }

    /**
     * Returns the point at a specified distance along the line.
     *
     * @param {Array<Array<number>>} line
     * @param {number} dist distance
     * @returns {Array<number>} point [longitude, latitude]
     * @example
     * const point = ruler.along(line, 2.5);
     * //=point
     */
    along(line, dist) {
        let sum = 0;

        if (dist <= 0) return line[0];

        for (let i = 0; i < line.length - 1; i++) {
            const p0 = line[i];
            const p1 = line[i + 1];
            const d = this.distance(p0, p1);
            sum += d;
            if (sum > dist) return interpolate(p0, p1, (dist - (sum - d)) / d);
        }

        return line[line.length - 1];
    }

    /**
     * Returns the distance from a point `p` to a line segment `a` to `b`.
     *
     * @pointToSegmentDistance
     * @param {Array<number>} p point [longitude, latitude]
     * @param {Array<number>} p1 segment point 1 [longitude, latitude]
     * @param {Array<number>} p2 segment point 2 [longitude, latitude]
     * @returns {number} distance
     * @example
     * const distance = ruler.pointToSegmentDistance([-67.04, 50.5], [-67.05, 50.57], [-67.03, 50.54]);
     * //=distance
     */
    pointToSegmentDistance(p, a, b) {
        let [x, y] = a;
        let dx = wrap(b[0] - x) * this.kx;
        let dy = (b[1] - y) * this.ky;
        let t = 0;

        if (dx !== 0 || dy !== 0) {
            t = (wrap(p[0] - x) * this.kx * dx + (p[1] - y) * this.ky * dy) / (dx * dx + dy * dy);

            if (t > 1) {
                x = b[0];
                y = b[1];

            } else if (t > 0) {
                x += (dx / this.kx) * t;
                y += (dy / this.ky) * t;
            }
        }

        dx = wrap(p[0] - x) * this.kx;
        dy = (p[1] - y) * this.ky;

        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Returns an object of the form {point, index, t}, where point is closest point on the line
     * from the given point, index is the start index of the segment with the closest point,
     * and t is a parameter from 0 to 1 that indicates where the closest point is on that segment.
     *
     * @param {Array<Array<number>>} line
     * @param {Array<number>} p point [longitude, latitude]
     * @returns {Object} {point, index, t}
     * @example
     * const point = ruler.pointOnLine(line, [-67.04, 50.5]).point;
     * //=point
     */
    pointOnLine(line, p) {
        let minDist = Infinity;
        let minX, minY, minI, minT;

        for (let i = 0; i < line.length - 1; i++) {

            let x = line[i][0];
            let y = line[i][1];
            let dx = wrap(line[i + 1][0] - x) * this.kx;
            let dy = (line[i + 1][1] - y) * this.ky;
            let t = 0;

            if (dx !== 0 || dy !== 0) {
                t = (wrap(p[0] - x) * this.kx * dx + (p[1] - y) * this.ky * dy) / (dx * dx + dy * dy);

                if (t > 1) {
                    x = line[i + 1][0];
                    y = line[i + 1][1];

                } else if (t > 0) {
                    x += (dx / this.kx) * t;
                    y += (dy / this.ky) * t;
                }
            }

            dx = wrap(p[0] - x) * this.kx;
            dy = (p[1] - y) * this.ky;

            const sqDist = dx * dx + dy * dy;
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
            t: Math.max(0, Math.min(1, minT))
        };
    }

    /**
     * Returns a part of the given line between the start and the stop points (or their closest points on the line).
     *
     * @param {Array<number>} start point [longitude, latitude]
     * @param {Array<number>} stop point [longitude, latitude]
     * @param {Array<Array<number>>} line
     * @returns {Array<Array<number>>} line part of a line
     * @example
     * const line2 = ruler.lineSlice([-67.04, 50.5], [-67.05, 50.56], line1);
     * //=line2
     */
    lineSlice(start, stop, line) {
        let p1 = this.pointOnLine(line, start);
        let p2 = this.pointOnLine(line, stop);

        if (p1.index > p2.index || (p1.index === p2.index && p1.t > p2.t)) {
            const tmp = p1;
            p1 = p2;
            p2 = tmp;
        }

        const slice = [p1.point];

        const l = p1.index + 1;
        const r = p2.index;

        if (!equals(line[l], slice[0]) && l <= r)
            slice.push(line[l]);

        for (let i = l + 1; i <= r; i++) {
            slice.push(line[i]);
        }

        if (!equals(line[r], p2.point))
            slice.push(p2.point);

        return slice;
    }

    /**
     * Returns a part of the given line between the start and the stop points indicated by distance along the line.
     *
     * @param {number} start distance
     * @param {number} stop distance
     * @param {Array<Array<number>>} line
     * @returns {Array<Array<number>>} line part of a line
     * @example
     * const line2 = ruler.lineSliceAlong(10, 20, line1);
     * //=line2
     */
    lineSliceAlong(start, stop, line) {
        let sum = 0;
        const slice = [];

        for (let i = 0; i < line.length - 1; i++) {
            const p0 = line[i];
            const p1 = line[i + 1];
            const d = this.distance(p0, p1);

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
    }

    /**
     * Given a point, returns a bounding box object ([w, s, e, n]) created from the given point buffered by a given distance.
     *
     * @param {Array<number>} p point [longitude, latitude]
     * @param {number} buffer
     * @returns {Array<number>} box object ([w, s, e, n])
     * @example
     * const bbox = ruler.bufferPoint([30.5, 50.5], 0.01);
     * //=bbox
     */
    bufferPoint(p, buffer) {
        const v = buffer / this.ky;
        const h = buffer / this.kx;
        return [
            p[0] - h,
            p[1] - v,
            p[0] + h,
            p[1] + v
        ];
    }

    /**
     * Given a bounding box, returns the box buffered by a given distance.
     *
     * @param {Array<number>} box object ([w, s, e, n])
     * @param {number} buffer
     * @returns {Array<number>} box object ([w, s, e, n])
     * @example
     * const bbox = ruler.bufferBBox([30.5, 50.5, 31, 51], 0.2);
     * //=bbox
     */
    bufferBBox(bbox, buffer) {
        const v = buffer / this.ky;
        const h = buffer / this.kx;
        return [
            bbox[0] - h,
            bbox[1] - v,
            bbox[2] + h,
            bbox[3] + v
        ];
    }

    /**
     * Returns true if the given point is inside in the given bounding box, otherwise false.
     *
     * @param {Array<number>} p point [longitude, latitude]
     * @param {Array<number>} box object ([w, s, e, n])
     * @returns {boolean}
     * @example
     * const inside = ruler.insideBBox([30.5, 50.5], [30, 50, 31, 51]);
     * //=inside
     */
    insideBBox(p, bbox) {
        return wrap(p[0] - bbox[0]) >= 0 &&
               wrap(p[0] - bbox[2]) <= 0 &&
               p[1] >= bbox[1] &&
               p[1] <= bbox[3];
    }
}

function equals(a, b) {
    return a[0] === b[0] && a[1] === b[1];
}

function interpolate(a, b, t) {
    const dx = wrap(b[0] - a[0]);
    const dy = b[1] - a[1];
    return [
        a[0] + dx * t,
        a[1] + dy * t
    ];
}

// normalize a degree value into [-180..180] range
function wrap(deg) {
    while (deg < -180) deg += 360;
    while (deg > 180) deg -= 360;
    return deg;
}
