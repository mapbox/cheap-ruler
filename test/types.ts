import * as cheapRuler from '../'
import { Point, Polygon, Line } from '../'

/**
 * Declare variables
 */
const point1: Point = [30.5, 50.5]
const point2: Point = [30.51, 50.49]
const polygon: Polygon = [[
    [-67.031, 50.458], [-67.031, 50.534], [-66.929, 50.534],
    [-66.929, 50.458], [-67.031, 50.458]
]]
const line: Line = [
    [-67.031, 50.458], [-67.031, 50.534],
    [-66.929, 50.534], [-66.929, 50.458]
]

/**
 * Test Types
 */
const units = cheapRuler.units
const ruler = cheapRuler(35.05, 'miles')
ruler.distance(point1, point2)
ruler.bearing(point1, point2)
ruler.destination(point1, 0.1, 90)
ruler.area(polygon)
ruler.along(line, 2.5)
ruler.lineDistance(line)
ruler.pointOnLine(line, point1).point
ruler.lineSlice(point1, point2, line)
ruler.lineSliceAlong(10, 20, line)
ruler.bufferPoint(point1, 0.01)
ruler.bufferBBox([30.5, 50.5, 31, 51], 0.2)
ruler.insideBBox([30.5, 50.5], [30, 50, 31, 51])
