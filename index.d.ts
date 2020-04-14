type BBox = [number, number, number, number];
type Point = [number, number];
type Line = Point[];
type Points = Point[];
type Polygon = Point[][];

declare class CheapRuler{
    constructor(lat: number, units?: string);

    distance(a: Point, b: Point): number;
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
    offset(p: Point, dx: number, dy: number): Point;

    static fromTile(y: number, z: number, units?: string): CheapRuler;
}

export = CheapRuler;
