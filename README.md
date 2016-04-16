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

Given two points of the form `[x, y]`, returns the distance. Typically within 0.1% of `turf.distance` values but 20–25 times faster.

#### lineDistance(points)

Given an array of points, returns the total line distance. Typically within 0.1% of `turf.lineDistance` values but 20–25 times faster.

#### bearing(a, b)

Returns the bearing between two points in angles. Typically within 0.01% of `turf.bearing` but 3–4 times faster.

#### bufferPoint(p, buffer)

Given a point, returns a bounding box object (`[w, s, e, n]`) created from the given point buffered by a given distance.
This is about _200 times faster_ than creating a bounding box with two diagonal `turf.destination` calls.

```js
var bbox = ruler.bufferPoint([30.5, 50.5], 0.01);
```

#### bufferBBox(bbox, buffer)

Given a bounding box, returns the box buffered by a given distance.

#### insideBBox(p, bbox)

Returns true if the given point is inside in the given bounding box, otherwise false.
