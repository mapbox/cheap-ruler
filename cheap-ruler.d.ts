export type BBox = [number, number, number, number];
export type Point = [number, number];
export type Line = Point[];
export type Points = Point[];
export type Polygon = Point[][];

export interface Factors {
    kilometers: number;
    miles: number;
    nauticalmiles: number;
    meters: number;
    metres: number;
    yards: number;
    feet: number;
    inches: number;
}

export default class CheapRuler {
    public static fromTile(y: number, z: number, units?: string): CheapRuler;
    public static units: Factors;

    constructor(lat: number, units?: string);

    public distance(a: Point, b: Point): number;
    public bearing(a: Point, b: Point): number;
    public destination(p: Point, dist: number, bearing: number): Point;
    public lineDistance(points: Points): number;
    public area(polygon: Polygon): number;
    public along(line: Line, dist: number): Point;
    public pointToSegmentDistance(p: Point, a: Point, b: Point): number;
    public pointOnLine(line: Line, p: Point): {point: Point, index: number, t: number};
    public lineSlice(start: Point, stop: Point, line: Line): Line;
    public lineSliceAlong(start: number, stop: number, line: Line): Line;
    public bufferPoint(p: Point, buffer: number): BBox;
    public bufferBBox(bbox: BBox, buffer: number): BBox;
    public insideBBox(p: Point, bbox: BBox): boolean;
    public offset(p: Point, dx: number, dy: number): Point;
}
