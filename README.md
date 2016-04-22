# cheap-ruler [![Build Status](https://travis-ci.org/mapbox/cheap-ruler.svg?branch=master)](https://travis-ci.org/mapbox/cheap-ruler)

A collection of fast approximations to common geographic measurements, along with some utility functions.
Useful for speeding up analysis scripts when measuring things on a city scale,
replacing [Turf](http://turfjs.org/) calls in key places.

## Usage

```js
var ruler = cheapRuler(35.05, 'miles');

var distance = ruler.distance([30.51, 50.32], [30.52, 50.312]);
var lineLength = ruler.lineDistance(line.geometry.coordinates);
var bbox = ruler.bufferPoint([30.5, 50.5], 0.01);
```

For a city scale (a few dozen miles) and far away from poles,
the results are typically within 0.1% of corresponding Turf functions.

**Note**: to get the full performance benefit, create the ruler object once per an area of calculation (such as a tile), and then reuse it as much as possible.

### Creating a ruler object

#### cheapRuler(latitude[, units])

Creates a ruler object that will approximate measurements around the given latitude.
Units are either `kilometers` (default) or `miles`.

#### cheapRuler.fromTile(y, z[, units])

Creates a ruler object from tile coordinates (`y` and `z`). Convenient in `tile-reduce` scripts.

```js
var ruler = cheapRuler.fromTile(1567, 12);
```

### Ruler methods

#### distance(a, b)

Given two points of the form `[x, y]`, returns the distance.
20–25 times faster than `turf.distance`.

#### lineDistance(line)

Given a line (an array of points), returns the total line distance.
20–25 times faster than `turf.lineDistance`.

#### area(polygon)

Given a polygon (an array of rings, where each ring is an array of points), returns the area.
3–4 times faster than `turf.area`. Note that it returns the value in the specified units
(square kilometers by default) rather than square meters as in `turf.area`.

```js
var area = ruler.area([[
    [-67.031, 50.458],
    [-67.031, 50.534],
    [-66.929, 50.534],
    [-66.929, 50.458],
    [-67.031, 50.458]
]]);
```

#### bearing(a, b)

Returns the bearing between two points in angles.
3–4 times faster than `turf.bearing`.

#### pointOnLine(line, p)

Returns the closest point on the line from the given point.
80–90 times faster than `turf.pointOnLine`.

#### along(line, dist)

Returns the point at a specified distance along the line.
20-25 times faster than `turf.along`.

#### destination(p, dist, bearing)

Returns a new point given distance and bearing from the starting point.
6–7 times faster than `turf.destination`.

#### bufferPoint(p, buffer)

Given a point, returns a bounding box object (`[w, s, e, n]`) created from the given point buffered by a given distance.
About _200 times faster_ than creating a bounding box with two diagonal `turf.destination` calls.

```js
var bbox = ruler.bufferPoint([30.5, 50.5], 0.01);
```

#### bufferBBox(bbox, buffer)

Given a bounding box, returns the box buffered by a given distance.

#### insideBBox(p, bbox)

Returns true if the given point is inside in the given bounding box, otherwise false.

## Install

- NPM: `npm install cheap-ruler`
- Browser build (CDN): https://npmcdn.com/cheap-ruler@1.3.0/cheap-ruler.js
