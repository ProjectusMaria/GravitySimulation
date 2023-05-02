import { IPoint, IVector } from "./common";

export class Vector implements IVector {

    constructor(public x: number, public y: number) { 
    }
    public add(v: IVector) : IVector {
        return new Vector(this.x + v.x, this.y + v.y);
    }
    public sub(v: IVector): IVector {
        return new Vector(this.x - v.x, this.y - v.y);
    }
    public mul(n: number): IVector {
        return new Vector(this.x * n, this.y * n);
    }
    public div(n: number): IVector {
        return new Vector(this.x / n, this.y / n);
    }
    static move(pt1: IPoint, pt2: IPoint): IVector {
        const x = pt2.x - pt1.x;
        const y = pt2.y - pt1.y;
        return new Vector(x, y);
    }
    public get isNull(): boolean {
        return this.x === 0 && this.y === 0;
    }
    public get magnitude(): number {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }
    public normalize(): IVector {
        const magnitude = this.magnitude;
        return this.div(magnitude);        
    }
    public dir(direction: number): IVector {
        const magnitude = this.magnitude;
        return new Vector(Math.cos(direction) * magnitude, Math.sin(direction) * magnitude);
    }
    public angle(): number {
        return Math.atan2(this.y, this.x);
    }
    public dotProduct(v: IVector): number {
        return (this.x * v.x) + (this.y * v.y);
    }
    public crossProduct(v: IVector): number {
        return (this.x * v.x) - (this.y - v.y);
    }

    // static methods
    static unitVector(direction: number): IVector {
        return new Vector(Math.cos(direction), Math.sin(direction));
    }
    static fromPolar(length: number, angle: number): IVector {
        return new Vector(length * Math.cos(angle), length * Math.sin(angle));
    }

    public toString(): string {
        return `Vector <${this.x},${this.y}>`;
    }
}