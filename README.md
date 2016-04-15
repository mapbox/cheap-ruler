## cheap-ruler

A collection of fast approximations to common geographic measurements. Useful for speeding up analysis scripts when measuring things on a road scale.

### Usage

```js
var ruler = cheapRuler(35.05, 'miles');
var distance = ruler.distance([30.51, 50.32], [30.52, 50.312]);
```

#### cheapRuler(latitude[, units])

Creates a ruler object that will approximate measurements around the given latitude.
Units are either `kilometers` (default) or `miles`.

#### cheapRuler.fromTile(y, z[, units])

Creates a ruler object from tile coordinates (`y` and `z`). Convenient in `tile-reduce` scripts.

```js
var ruler = cheapRuler.fromTile(1567, 12);
```

#### ruler.distance(a, b)

Given two points of the form `[x, y]`, returns the distance. Typically within 0.1% of `turf.distance` values but 20 times faster.

#### ruler.distanceSq(a, b)

Returns the squared distance between two points.

#### ruler.bearing(a, b)

Returns the bearing between two points in angles. Typically within 0.001% of `turf.bearing` but 3-5 times faster.

#### ruler.bufferPoint(p, buffer)

Given a point, returns a bounding box object (`[w, s, e, n]`) created from the given point buffered by a given distance.

```js
var bbox = ruler.bufferPoint([30.5, 50.5], 0.01);
```
