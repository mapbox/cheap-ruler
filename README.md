# cheap-ruler [![Node](https://github.com/mapbox/cheap-ruler/actions/workflows/node.yml/badge.svg)](https://github.com/mapbox/cheap-ruler/actions/workflows/node.yml) [![](https://img.shields.io/badge/simply-awesome-brightgreen.svg)](https://github.com/mourner/projects)

A collection of very fast approximations to common geodesic measurements.
Useful for performance-sensitive code that measures things on a city scale. Can be an order of magnitude faster than corresponding [Turf](http://turfjs.org/) methods.

The approximations are based on the [WGS84 ellipsoid model of the Earth](https://en.wikipedia.org/wiki/Earth_radius#Meridional), projecting coordinates to a flat surface that approximates the ellipsoid around a certain latitude.
For distances under 500 kilometers and not on the poles,
the results are very precise — within [0.1% margin of error](#precision)
compared to [Vincenti formulas](https://en.wikipedia.org/wiki/Vincenty%27s_formulae),
and usually much less for shorter distances.

## Usage

```js
var ruler = new CheapRuler(35.05, 'miles'); // calculations around latitude 35
...
var distance = ruler.distance([30.51, 50.32], [30.52, 50.312]);
var lineLength = ruler.lineDistance(line.geometry.coordinates);
var bbox = ruler.bufferPoint([30.5, 50.5], 0.01);
```

**Note**: to get the full performance benefit,
create a ruler object only once per a general area of calculation,
and then reuse it as much as possible.
Don't create a new ruler for every calculation.

### Creating a ruler object

#### new CheapRuler(latitude[, units])

Creates a ruler object that will approximate measurements around the given latitude.
Units are one of: `kilometers` (default), `miles`, `nauticalmiles`, `meters`, `yards`, `feet`, `inches`.

```js
const ruler = new CheapRuler(50.5, 'meters');
````

#### CheapRuler.fromTile(y, z[, units])

Creates a ruler object from tile coordinates (`y` and `z`).

```js
const ruler = CheapRuler.fromTile(1567, 12);
```

### Ruler methods

#### distance(a, b)

Given two points of the form `[longitude, latitude]`, returns the distance.

```js
const distance = ruler.distance([30.5, 50.5], [30.51, 50.49]);
```

#### bearing(a, b)

Returns the bearing between two points in angles.

```js
const bearing = ruler.bearing([30.5, 50.5], [30.51, 50.49]);
```

#### destination(p, dist, bearing)

Returns a new point given distance and bearing from the starting point.

```js
const point = ruler.destination([30.5, 50.5], 0.1, 90);
```

#### offset(p, dx, dy)

Returns a new point given easting and northing offsets from the starting point.

```js
const point = ruler.offset([30.5, 50.5], 10, 5); // 10km east and 5km north
```

#### lineDistance(line)

Given a line (an array of points), returns the total line distance.

```js
const length = ruler.lineDistance([
    [-67.031, 50.458], [-67.031, 50.534],
    [-66.929, 50.534], [-66.929, 50.458]
]);
```

#### area(polygon)

Given a polygon (an array of rings, where each ring is an array of points), returns the area.
Note that it returns the value in the specified units
(square kilometers by default) rather than square meters as in `turf.area`.

```js
const area = ruler.area([[
    [-67.031, 50.458], [-67.031, 50.534], [-66.929, 50.534],
    [-66.929, 50.458], [-67.031, 50.458]
]]);
```

#### pointToSegmentDistance(p, a, b)

Returns the distance from a point `p` to a line segment `a` to `b`.

```js
const distance = ruler.pointToSegmentDistance([-77.034076, 38.882017],
    [-77.031669, 38.878605], [-77.029609, 38.881946]);
````

#### along(line, dist)

Returns the point at a specified distance along the line.

```js
const point = ruler.along(line, 2.5);
```

#### pointOnLine(line, p)

Returns an object of the form `{point, index, t}`, where `point` is closest point on the line from the given point,
`index` is the start index of the segment with the closest point, and `t` is a parameter from 0 to 1 that indicates
where the closest point is on that segment.

```js
const point = ruler.pointOnLine(line, [-67.04, 50.5]).point;
```

#### lineSlice(start, stop, line)

Returns a part of the given line between the start and the stop points (or their closest points on the line).

```js
const part = ruler.lineSlice([-67.04, 50.5], [-67.05, 50.56], line);
```

#### lineSliceAlong(startDist, stopDist, line)

Returns a part of the given line between the start and the stop points indicated by distance along the line.

```js
const part = ruler.lineSliceAlong(10, 20, line);
```

#### bufferPoint(p, buffer)

Given a point, returns a bounding box object (`[w, s, e, n]`) created from the given point buffered by a given distance.

```js
const bbox = ruler.bufferPoint([30.5, 50.5], 0.01);
```

#### bufferBBox(bbox, buffer)

Given a bounding box, returns the box buffered by a given distance.

```js
const bbox = ruler.bufferBBox([30.5, 50.5, 31, 51], 0.2);
```

#### insideBBox(p, bbox)

Returns true if the given point is inside in the given bounding box, otherwise false.

```js
const inside = ruler.insideBBox([30.5, 50.5], [30, 50, 31, 51]);
```

### Units conversion

Multipliers for converting between units are also exposed in `CheapRuler.units`:

```js
// convert 50 meters to yards
50 * CheapRuler.units.yards / CheapRuler.units.meters;
```

If you don't specify units when creating a ruler object,
you can use these constants to convert return values (using multiplication)
and input arguments (using division) to any units:

```js
// get distance between points in feet
const distanceInFeet = ruler.distance(a, b) * CheapRuler.units.feet;

// make a bbox from a point with a 200 inch buffer
const box = ruler.bufferPoint(p, 200 / CheapRuler.units.inches);
```

## Install

- NPM: `npm install cheap-ruler`
- [Browser build on CDN (ESM)](https://esm.run/cheap-ruler)
- [Browser build on CDN (UMD)](https://cdn.jsdelivr.net/npm/cheap-ruler/cheap-ruler.js)

## Precision

A table that shows the margin of error for `ruler.distance` compared to `node-vincenty`
(a state of the art distance formula):

| lat | 0&deg; | 10&deg; | 20&deg; | 30&deg; | 40&deg; | 50&deg; | 60&deg; | 70&deg; | 80&deg; |
| --- |  --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1km | 0% | 0% | 0% | 0% | 0% | 0% | 0% | 0% | 0% |
| 100km | 0% | 0% | 0% | 0% | 0% | 0% | 0% | 0.01% | 0.03% |
| 500km | 0.01% | 0.01% | 0.01% | 0.01% | 0.02% | 0.04% | 0.08% | 0.2% | 0.83% |
| 1000km | 0.03% | 0.03% | 0.04% | 0.06% | 0.1% | 0.17% | 0.33% | 0.8% | 3.38% |

Errors for all other methods are similar.

## Related

- [cheap-ruler-cpp](https://github.com/mapbox/cheap-ruler-cpp) – C++ port of this library
- [cheap-ruler-rs](https://github.com/vipera/cheap-ruler-rs) – Rust port of this library
- [flat-projection](https://github.com/Turbo87/flat-projection-rs) – Rust library based on the same concept
