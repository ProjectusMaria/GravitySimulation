import {OrderedMap} from 'immutable';
import * as _ from 'lodash';

export interface ISceneObject {
    name: string;
    enabled: boolean;
    position: IPoint;
    trace?: boolean;
    trace_limit?: number;
    delta(scene: IScene): void;
    collide(scene: IScene): void;
    draw(scene: IScene): void;
    draw_trace(scene: IScene): void;
    pan(p: IVector): void;
}
export interface IScene {
    ctx: CanvasRenderingContext2D;
    objects: OrderedMap<string, ISceneObject>;
    add(obj: ISceneObject): IScene;
    remove(name: string): IScene;
    hide(name: string): IScene;
    show(name: string): IScene;
    hideAllButOne(name: string): IScene;
    updateByKey(name: string, obj: ISceneObject): IScene;
    update(obj: ISceneObject | ISceneObject[]): IScene;
    updateWithCondition(condition: (obj: ISceneObject) => boolean, map: (obj: ISceneObject) => ISceneObject): void;
    clear(): IScene;
    postCalc: (() => void) | null;
    draw(): void;
    resize(): void;
    X(x: number): number;
    Y(y: number): number;
    worldX(x: number): number;
    worldY(y: number): number;
    scale: number;
    VisibleWorldHeight: number;
    width: number;
    height: number;
    gravity: number;
    elasticity: number;
    friction: number;
    mode: AppMode;
    inPause: boolean;
    showVelocityVector: boolean;
    showAccelerationVector: boolean;
    playSound: boolean;
}
export interface IPoint {
    x: number;
    y: number;
}
export interface IRect {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface ISize {
    width: number;
    height: number;
}
export interface IVector {
    x: number;
    y: number;
    add(v: IVector) : IVector;
    sub(v: IVector): IVector;
    mul(n: number): IVector;
    div(n: number): IVector;
    magnitude: number; 
    normalize(): IVector; 
    dir(direction: number): IVector;
    dotProduct(v: IVector): number;
    crossProduct(v: IVector): number;    
    toString(): string;
    isNull: boolean;
    angle(): number;
}
export interface ICircle {
    center: IPoint;
    radius: number;
}
export function hitTestCircle(c1: ICircle, c2: ICircle): boolean {
    let result = false;
    const dx = c1.center.x - c2.center.x;
    const dy = c1.center.y - c2.center.y;
    const distance = (dx*dx + dy*dy);
    if (distance <= (c1.radius + c2.radius) * (c1.radius + c2.radius)) {
        result = true;
    }
    return result;
}

export enum AppMode {
    About, 
    SurfaceGravity, 
    SpaceGravity
}

export enum SymState {
    Playing,
    Paused,
    Stopped
}

export function uuid() {  
    let uuidValue = "", k, randomValue;  
    for (let k = 0; k < 32; k++) {  
        randomValue = Math.random() * 16 | 0;  

        if (k == 8 || k == 12 || k == 16 || k == 20) {  
            uuidValue += "-";
        }  
        uuidValue += (k == 12 ? 4 : (k == 16 ? (randomValue & 3 | 8) : randomValue)).toString(16);  
    }  
    return uuidValue;  
}  

export function drawArrowhead(ctx: CanvasRenderingContext2D, from: IPoint, to: IPoint, radius: number, color: string) {
	var x_center = to.x;
	var y_center = to.y;

	var angle;
	var x;
	var y;

	ctx.beginPath();
	angle = Math.atan2(to.y - from.y, to.x - from.x)
	x = radius * Math.cos(angle) + x_center;
	y = radius * Math.sin(angle) + y_center;
	ctx.moveTo(x, y);
	angle += (1.0/3.0) * (2 * Math.PI)
	x = radius * Math.cos(angle) + x_center;
	y = radius * Math.sin(angle) + y_center;
	ctx.lineTo(x, y);
	angle += (1.0/3.0) * (2 * Math.PI)
	x = radius * Math.cos(angle) + x_center;
	y = radius * Math.sin(angle) + y_center;
	ctx.lineTo(x, y);
	ctx.closePath();
    ctx.fillStyle = color;
	ctx.fill();
}