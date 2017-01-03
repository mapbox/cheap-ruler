declare function cheapRuler(lat: number, units?: string): cheapRuler.CheapRuler;
declare namespace cheapRuler {
    type BBox = [number, number, number, number]
    type Point = [number, number]
    type Line = Point[]
    type Points = Point[]
    type Polygon = Point[][]

    class CheapRuler {
        distance(a: cheapRuler.Point, b: Point): number;
        bearing(a: Point, b: Point): number;
        destination(p: Point, dist: number, bearing: number): Point;
        lineDistance(points: Points): number;
        area(polygon: Polygon): number;
        along(line: Line, dist: number): Point;
        pointOnLine(line: Line, p: Point): {point: Point, index: number, t: number};
        lineSlice(start: Point, stop: Point, line: Line): Line;
        lineSliceAlong(start: number, stop: number, line: Line): Line;
        bufferPoint(p: Point, buffer: number): BBox;
        bufferBBox(bbox: BBox, buffer: number): BBox;
        insideBBox(p: Point, bbox: BBox): boolean;
    }
    const units: {
        kilometers: number;
        miles: number;
        nauticalmiles: number;
        meters: number;
        metres: number;
        yards: number;
        feet: number;
        inches: number;
    }
    function fromTile(y: number, z: number, units?: string): CheapRuler;
}
export = cheapRuler;
